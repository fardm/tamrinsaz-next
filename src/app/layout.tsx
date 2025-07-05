// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "تمرین‌ساز - برنامه‌ساز ورزشی و تمرینات بدنسازی",
  description: "با تمرین‌ساز، برنامه ورزشی خود را بسازید و به مجموعه کاملی از تمرینات بدنسازی دسترسی داشته باشید. شامل عضلات درگیر، وسایل مورد نیاز و توضیحات کامل.",
  keywords: ["تمرین‌ساز", "برنامه ورزشی", "بدنسازی", "تمرینات", "فیتنس", "عضلات", "باشگاه", "ورزش"],
  openGraph: {
    title: "تمرین‌ساز - برنامه‌ساز ورزشی و تمرینات بدنسازی",
    description: "با تمرین‌ساز، برنامه ورزشی خود را بسازید و به مجموعه کاملی از تمرینات بدنسازی دسترسی داشته باشید.",
    url: "https://app.tamrinsaz.ir",
    siteName: "تمرین‌ساز",
    images: [
      {
        url: "https://app.tamrinsaz.ir/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "تمرین‌ساز - برنامه ورزشی",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "تمرین‌ساز - برنامه‌ساز ورزشی و تمرینات بدنسازی",
    description: "با تمرین‌ساز، برنامه ورزشی خود را بسازید و به مجموعه کاملی از تمرینات بدنسازی دسترسی داشته باشید.",
    images: ["https://app.tamrinsaz.ir/twitter-image.jpg"],
  },
  other: {
    "dc.language": "fa",
    "og:locale:alternate": "fa_IR",
  },
  icons: { // اضافه کردن آیکون‌ها برای فاوآیکون
    icon: '/favicon.svg', // مسیردهی به فایل فاوآیکون در پوشه public
    // shortcut: '/favicon-16x16.png', // می‌توانید سایزهای مختلف را اضافه کنید
    // apple: '/apple-touch-icon.png', // برای دستگاه‌های اپل
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // حذف فضای خالی بین تگ <html> و <body>
    <html lang="fa" dir="rtl"><body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col min-h-screen`}>
      <Header />
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <Footer />
    </body></html>
  );
}
