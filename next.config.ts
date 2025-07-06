import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // این تنظیم برای خروجی گرفتن پروژه به صورت استاتیک ضروری است
  images: {
    unoptimized: true, // این خط بهینه‌سازی تصاویر Next.js را غیرفعال می‌کند
  },
  basePath: '', 
  // assetPrefix را به صورت شرطی تنظیم می‌کنیم تا فقط در محیط پروداکشن اعمال شود.
  // در محیط توسعه (npm run dev)، assetPrefix به undefined تنظیم می‌شود تا فایل‌ها از روت لوکال بارگذاری شوند.
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://app.tamrinsaz.ir/' : undefined,
};

export default nextConfig;
