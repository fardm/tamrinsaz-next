// src/app/layout.tsx
import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // Keep if you use Inter for other parts, otherwise remove
import "./globals.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

// Vazirmatn font is now handled via @font-face in globals.css and preloaded below
// const inter = Inter({ subsets: ["latin"] }); // Keep if you use Inter for other parts, otherwise remove

export const metadata: Metadata = {
  title: "تمرین‌ساز بدنسازی | ساخت برنامه بدنسازی",
  description: "با تمرین‌ساز برنامه تمرینی شخصی‌سازی‌شده بسازید و به بانک کامل تمرینات بدنسازی با توضیحات، عضلات هدف و ویدیوهای آموزشی دسترسی داشته باشید.",
  keywords: ["تمرین‌ساز", "برنامه ورزشی", "برنامه بدنسازی", "تمرینات بدنسازی", "ورزش در خانه", "بدنسازی در باشگاه", "ورزش"],
  openGraph: {
    title: "تمرین‌ساز بدنسازی | ساخت برنامه بدنسازی",
    description: "با تمرین‌ساز برنامه تمرینی شخصی‌سازی‌شده بسازید و به بانک کامل تمرینات بدنسازی با توضیحات، عضلات هدف و ویدیوهای آموزشی دسترسی داشته باشید.",
    url: "https://tamrinsaz.ir",
    siteName: "تمرین‌ساز بدنسازی",
    images: [
      {
        url: "https://tamrinsaz.ir/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "تمرین‌ساز بدنسازی | برنامه بدنسازی",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "تمرین‌ساز بدنسازی | ساخت برنامه بدنسازی",
    description: "با تمرین‌ساز برنامه تمرینی شخصی‌سازی‌شده بسازید و به بانک کامل تمرینات بدنسازی با توضیحات، عضلات هدف و ویدیوهای آموزشی دسترسی داشته باشید.",
    images: ["https://tamrinsaz.ir/og-image.jpg"],
  },
  other: {
    "dc.language": "fa",
    "og:locale:alternate": "fa_IR",
  },
  icons: { 
    icon: '/favicon.svg',
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
    <html lang="fa" dir="rtl">
      <head>
        {/* Preload the Vazirmatn variable font file for faster loading */}
        <link
          rel="preload"
          href="/fonts/Vazirmatn.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow container mx-auto p-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
