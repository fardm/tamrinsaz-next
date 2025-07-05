import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // این تنظیم برای خروجی گرفتن پروژه به صورت استاتیک ضروری است
  images: {
    unoptimized: true, // این خط بهینه‌سازی تصاویر Next.js را غیرفعال می‌کند
  },
  // برای ساب‌دامین ریشه (app.tamrinsaz.ir) basePath را خالی تنظیم کنید.
  basePath: '', 
  // assetPrefix را حذف می‌کنیم، زیرا برای ساب‌دامین ریشه معمولاً نیازی به آن نیست.
  // assetPrefix: 'https://app.tamrinsaz.ir/', // این خط حذف شد
};

export default nextConfig;
