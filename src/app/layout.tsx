// src/app/layout.tsx
import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import "./globals.css"; // import استایل‌های عمومی

export const metadata: Metadata = {
  title: "تمرین‌ساز - برنامه تمرینی شخصی شما",
  description: "با تمرین‌ساز، برنامه‌های تمرینی شخصی‌سازی شده خود را بسازید، مدیریت کنید و بهینه‌سازی کنید. شامل تمرینات متنوع و ابزارهای هوش مصنوعی.",
  keywords: ["تمرین‌ساز", "برنامه بدنسازی", "تمرینات ورزشی", "هوش مصنوعی", "فیتنس", "ورزش", "باشگاه"],
  openGraph: {
    title: "تمرین‌ساز - برنامه تمرینی شخصی شما",
    description: "با تمرین‌ساز، برنامه‌های تمرینی شخصی‌سازی شده خود را بسازید، مدیریت کنید و بهینه‌سازی کنید. شامل تمرینات متنوع و ابزارهای هوش مصنوعی.",
    url: "https://tamrinsaz.ir", // آدرس سایت خود را اینجا قرار دهید
    siteName: "TamrinSaz",
    images: [
      {
        url: "https://tamrinsaz.ir/og-image.jpg", // تصویر Open Graph برای اشتراک‌گذاری در شبکه‌های اجتماعی
        width: 1200,
        height: 630,
        alt: "TamrinSaz - Your Personal Workout Planner",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "تمرین‌ساز - برنامه تمرینی شخصی شما",
    description: "با تمرین‌ساز، برنامه‌های تمرینی شخصی‌سازی شده خود را بسازید، مدیریت کنید و بهینه‌سازی کنید. شامل تمرینات متنوع و ابزارهای هوش مصنوعی.",
    creator: "@yourtwitterhandle", // اگر حساب توییتر دارید
    images: ["https://tamrinsaz.ir/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: { // <--- این پراپرتی 'icons' را اضافه کنید
    icon: '/favicon.svg', // مسیر فاوآیکون SVG شما در پوشه public
  },
  other: {
    "charset": "UTF-8",
    "viewport": "width=device-width, initial-scale=1.0",
    "dir": "rtl",
    "lang": "fa"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}