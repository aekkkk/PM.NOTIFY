import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // build เป็นเว็บ static (โฟลเดอร์ out/) เพื่อ deploy ขึ้น Cloudflare
  output: "export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
