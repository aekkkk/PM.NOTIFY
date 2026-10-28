"use client";

// หน้าประวัติการแจ้งเตือน: ตารางช่วงเวลาที่ PM2.5 เกินเกณฑ์ + แบ่งหน้า
import { useState } from "react";
import { useData } from "@/components/DataProvider";
import { StatusBadge } from "@/components/ui/Badge";
import { Pagination, RowsPerPage } from "@/components/ui/Pagination";
import { PM25_THRESHOLD, fmt1, fmtDate, fmtDuration, fmtTime, getAirLevel } from "@/lib/airQuality";

const rowOptions = [5, 10, 20] as const;

export function History() {
  const { exceedances, loading } = useData();
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<(typeof rowOptions)[number]>(10);

  const total = exceedances.length;
  const totalPages = Math.max(1, Math.ceil(total / rows));
  const safePage = Math.min(page, totalPages);
  const first = (safePage - 1) * rows;
  const pageItems = exceedances.slice(first, first + rows);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">ประวัติการแจ้งเตือน</h1>
        <p className="mt-1 text-[14px] text-neutral-500 home-dark:text-neutral-400">
          ช่วงเวลาที่ PM2.5 เกินเกณฑ์ {PM25_THRESHOLD} µg/m³ ในช่วง 7 วันที่ผ่านมา (ค่า PM2.5 คือค่าสูงสุดในช่วงนั้น)
        </p>
      </div>

      {loading ? (
        <p className="py-16 text-center text-neutral-500">กำลังโหลดข้อมูล…</p>
      ) : !total ? (
        <p className="rounded-2xl border border-neutral-200 py-16 text-center text-neutral-500 home-dark:border-neutral-800">ยังไม่มีช่วงที่ฝุ่นเกินเกณฑ์ 🎉</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xs home-dark:border-neutral-800 home-dark:bg-neutral-900">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead className="bg-neutral-100 text-[13px] text-neutral-500 home-dark:bg-neutral-800 home-dark:text-neutral-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">เวลา</th>
                  <th scope="col" className="px-4 py-3 font-medium">ค่า PM2.5</th>
                  <th scope="col" className="px-4 py-3 font-medium">ระดับ</th>
                  <th scope="col" className="px-4 py-3 font-medium">ระยะเวลาที่เกินเกณฑ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 home-dark:divide-neutral-800">
                {pageItems.map((event) => {
                  const level = getAirLevel(event.peak);
                  return (
                    <tr key={event.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {fmtDate(new Date(event.start))} <span className="text-neutral-500 home-dark:text-neutral-400">{fmtTime(new Date(event.start))}</span>
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap tabular-nums">{fmt1(event.peak)} µg/m³</td>
                      <td className="px-4 py-2">
                        <StatusBadge status={level.badge}>{level.label}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {fmtDuration(event.end - event.start)}
                        {event.ongoing && <span className="ml-2 text-[12px] text-[#b56a00] home-dark:text-[#ff9900]">ยังเกินอยู่</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-[14px] text-neutral-500 tabular-nums home-dark:text-neutral-400">
              {first + 1}–{Math.min(first + rows, total)} จาก {total} รายการ
            </p>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            <RowsPerPage
              value={rows}
              options={rowOptions}
              onChange={(value) => {
                setRows(value);
                setPage(1);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
