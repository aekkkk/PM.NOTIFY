/*
  PM.Notify — โค้ดสำหรับบอร์ด Seeed Studio XIAO ESP32-C6
  อ่านค่าฝุ่น (PMSA003) + อุณหภูมิ/ความชื้น (BME280) แล้วส่ง JSON ขึ้น Firebase Realtime Database
    PUT  /devices/pmnotify-01/latest.json   ← ค่าล่าสุด (เขียนทับ)
    POST /devices/pmnotify-01/history.json  ← ต่อท้ายประวัติ (Firebase สร้าง pushId ให้)
  ระหว่างรอบเครื่องจะ Deep Sleep เพื่อประหยัดแบตเตอรี่

  ไลบรารีที่ต้องติดตั้ง (Library Manager):
    - Adafruit BME280 Library (และ Adafruit Unified Sensor)
    - U8g2 (จอ OLED 1.3" ชิป SH1106)
  เลือกบอร์ด: Tools > Board > esp32 > XIAO_ESP32C6

  การต่อสาย:
    PMSA003  TX → D7 (RX ของบอร์ด), RX → D6 (TX ของบอร์ด), VCC → 5V (จาก MT3608), GND → GND
    BME280   SDA → D4, SCL → D5, VCC → 3V3
    OLED     SDA → D4, SCL → D5, VCC → 3V3
    แบตเตอรี่ → ตัวต้านทานแบ่งแรงดัน 100k/100k → A0 (วัดเปอร์เซ็นต์แบต)
*/
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <time.h>
#include <Adafruit_BME280.h>
#include <U8g2lib.h>

// ---------- ตั้งค่าตรงนี้ ----------
const char* WIFI_SSID = "ชื่อ Wi-Fi";
const char* WIFI_PASS = "รหัส Wi-Fi";
// URL ของ Realtime Database (ไม่มี / ท้าย) เช่น https://pm-notify-default-rtdb.asia-southeast1.firebasedatabase.app
const char* FIREBASE_URL = "https://YOUR-PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app";
// Database secret: Firebase Console > Project settings > Service accounts > Database secrets
const char* FIREBASE_SECRET = "ใส่ database secret";
const char* DEVICE_ID = "pmnotify-01";

const uint32_t SEND_EVERY_SEC = 2 * 60;      // ส่งทุก 2 นาที (เลือกได้ 1–5 นาที)
const uint32_t LOW_BATT_SLEEP_SEC = 30 * 60; // แบตต่ำกว่า 30% → หลับนาน 30 นาที
const uint32_t PM_WARMUP_MS = 30000;         // พัดลมเซนเซอร์ฝุ่นต้องหมุนก่อน ~30 วินาทีให้ค่านิ่ง

Adafruit_BME280 bme;
U8G2_SH1106_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);
HardwareSerial pmSerial(1);

struct PmData { uint16_t pm1, pm25, pm10; };

// อ่าน 1 เฟรม (32 ไบต์) จาก PMSA003: ขึ้นต้นด้วย 0x42 0x4D และมี checksum ท้ายเฟรม
bool readPm(PmData& out, uint32_t timeoutMs = 3000) {
  uint8_t buf[32];
  uint32_t start = millis();
  while (millis() - start < timeoutMs) {
    if (pmSerial.available() < 32) { delay(10); continue; }
    if (pmSerial.read() != 0x42) continue;
    if (pmSerial.peek() != 0x4D) continue;
    buf[0] = 0x42;
    pmSerial.readBytes(buf + 1, 31);
    uint16_t sum = 0;
    for (int i = 0; i < 30; i++) sum += buf[i];
    if (sum != ((buf[30] << 8) | buf[31])) continue; // ข้อมูลเสีย อ่านใหม่
    // ไบต์ 10–15 คือค่าในบรรยากาศจริง (atmospheric environment)
    out.pm1 = (buf[10] << 8) | buf[11];
    out.pm25 = (buf[12] << 8) | buf[13];
    out.pm10 = (buf[14] << 8) | buf[15];
    return true;
  }
  return false;
}

// อ่านค่าหลายเฟรมแล้วเฉลี่ย ให้ค่านิ่งขึ้น
bool readPmAverage(float& pm1, float& pm25, float& pm10) {
  PmData d; int n = 0; pm1 = pm25 = pm10 = 0;
  for (int i = 0; i < 10; i++) {
    if (readPm(d)) { pm1 += d.pm1; pm25 += d.pm25; pm10 += d.pm10; n++; }
  }
  if (!n) return false;
  pm1 /= n; pm25 /= n; pm10 /= n;
  return true;
}

// แปลงแรงดันแบตเตอรี่ (3.3–4.2V) เป็นเปอร์เซ็นต์
int readBatteryPercent() {
  uint32_t mv = 0;
  for (int i = 0; i < 16; i++) mv += analogReadMilliVolts(A0);
  float volts = (mv / 16.0f) * 2.0f / 1000.0f; // คูณ 2 เพราะใช้ตัวต้านทานแบ่งแรงดันครึ่งหนึ่ง
  int pct = (int)((volts - 3.3f) / (4.2f - 3.3f) * 100.0f);
  return constrain(pct, 0, 100);
}

void showOled(const char* line1, const char* line2) {
  oled.clearBuffer();
  oled.setFont(u8g2_font_6x12_tf);
  oled.drawStr(0, 12, "PM.Notify");
  oled.setFont(u8g2_font_logisoso16_tf);
  oled.drawStr(0, 38, line1);
  oled.setFont(u8g2_font_6x12_tf);
  oled.drawStr(0, 58, line2);
  oled.sendBuffer();
}

bool connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) delay(500);
  return WiFi.status() == WL_CONNECTED;
}

// ส่งคำสั่งไป Firebase REST API (method = "PUT" หรือ "POST")
bool sendFirebase(const char* method, const String& path, const String& json) {
  WiFiClientSecure client;
  client.setInsecure(); // ข้ามการตรวจใบรับรองเพื่อความง่าย (เหมาะกับงานต้นแบบ)
  HTTPClient http;
  String url = String(FIREBASE_URL) + path + ".json?auth=" + FIREBASE_SECRET;
  if (!http.begin(client, url)) return false;
  http.addHeader("Content-Type", "application/json");
  int code = http.sendRequest(method, json);
  http.end();
  Serial.printf("%s %s -> %d\n", method, path.c_str(), code);
  return code == 200;
}

void goToSleep(uint32_t seconds) {
  oled.setPowerSave(1);
  WiFi.disconnect(true);
  if (seconds > 0) esp_sleep_enable_timer_wakeup((uint64_t)seconds * 1000000ULL);
  esp_deep_sleep_start(); // ถ้าไม่ตั้งเวลาปลุก = ปิดระบบจนกว่าจะกดรีเซ็ต
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  oled.begin();
  pmSerial.begin(9600, SERIAL_8N1, D7, D6);
  bool bmeOk = bme.begin(0x76) || bme.begin(0x77);

  int battery = readBatteryPercent();
  // แบตต่ำกว่า 10% → ปิดระบบเพื่อถนอมแบตเตอรี่
  if (battery < 10) {
    showOled("LOW BATT", "Shutting down");
    delay(2000);
    goToSleep(0);
  }

  showOled("...", "Warming up sensor");
  delay(PM_WARMUP_MS);

  float pm1, pm25, pm10;
  if (!readPmAverage(pm1, pm25, pm10)) {
    showOled("PM ERR", "Check PMSA003 wiring");
    goToSleep(SEND_EVERY_SEC);
  }
  // ถ้าอ่าน BME280 ไม่ได้ ส่ง 0 แทน (ค่า NaN ทำให้ JSON ใช้ไม่ได้)
  float temperature = bmeOk ? bme.readTemperature() : 0;
  float humidity = bmeOk ? bme.readHumidity() : 0;

  char line1[24], line2[32];
  snprintf(line1, sizeof(line1), "%.1f ug", pm25);
  snprintf(line2, sizeof(line2), "%.1fC %.0f%%RH Batt %d%%", temperature, humidity, battery);
  showOled(line1, line2);

  bool lowBattery = battery < 30; // รอบสุดท้ายก่อนเข้า Deep Sleep ยาว
  if (connectWifi()) {
    // ขอเวลาจริงจากอินเทอร์เน็ต (เขตเวลาไทย UTC+7)
    configTime(7 * 3600, 0, "pool.ntp.org", "time.google.com");
    struct tm now;
    char ts[32] = "";
    if (getLocalTime(&now, 10000)) strftime(ts, sizeof(ts), "%Y-%m-%dT%H:%M:%S+07:00", &now);

    // สร้าง JSON ตามรูปแบบที่เว็บไซต์ต้องการ
    char json[320];
    snprintf(json, sizeof(json),
             "{\"device_id\":\"%s\",\"timestamp\":\"%s\",\"pm1\":%.1f,\"pm25\":%.1f,\"pm10\":%.1f,"
             "\"temperature\":%.1f,\"humidity\":%.1f,\"battery\":%d,\"status\":\"%s\"}",
             DEVICE_ID, ts, pm1, pm25, pm10, temperature, humidity, battery, lowBattery ? "deep_sleep" : "online");
    Serial.println(json);

    if (ts[0]) { // ส่งเฉพาะเมื่อได้เวลาที่ถูกต้อง ไม่อย่างนั้นเว็บจะเรียงข้อมูลผิด
      String base = String("/devices/") + DEVICE_ID;
      sendFirebase("PUT", base + "/latest", json);
      sendFirebase("POST", base + "/history", json);
    }
  } else {
    Serial.println("Wi-Fi connect failed");
  }

  goToSleep(lowBattery ? LOW_BATT_SLEEP_SEC : SEND_EVERY_SEC);
}

void loop() {
  // ไม่ใช้ loop เพราะทุกรอบเครื่องตื่นจาก Deep Sleep แล้วเริ่ม setup() ใหม่
}
