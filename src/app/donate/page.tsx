// src/app/donate/page.tsx
"use client";

import React from 'react';
import { CreditCard, Heart } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* عنوان صفحه */}
      <div className="mb-8 flex items-center space-x-3 space-x-reverse">
        <Heart className="h-7 w-7 text-gray-700 dark:text-gray-300" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          حمایت مالی
        </h1>
      </div>

      {/* محتوای صفحه */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-right leading-relaxed">
          سایت تمرین‌ساز به صورت رایگان عرضه شده تا همه بدون محدودیت از آن استفاده کنند. اگر این ابزار برای شما مفید بوده می‌توانید با حمایت مالی به توسعه و بهبود مستمر این سایت کمک کنید.
        </p>

        {/* دکمه پرداخت */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <a
            href="https://coffeete.ir/ifard"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-base shadow-md hover:shadow-lg flex items-center justify-center space-x-2 space-x-reverse"
          >
            <CreditCard className="h-5 w-5" />
            <span>پرداخت با سایت کافیته</span>
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            پرداخت ریالی با کارت‌های بانکی از طریق درگاه زرین پال
          </p>
        </div>

        {/* لینک بازگشت به صفحه اصلی */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}