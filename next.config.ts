import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ส่งออกเป็นไฟล์ static ทั้งชุด (npm run build) เพื่ออัปขึ้น Netlify
     ส่วน npm run dev ยังใช้รันในเครื่องวันจัดค่ายได้ตามปกติ */
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
