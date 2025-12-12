// src/app/ai-workout-generator/page.tsx
"use client";

import React, { useRef, useState } from 'react';
import { Copy, Bot } from 'lucide-react';

export default function AIGenWorkoutPage() {
  const promptTextRef = useRef<HTMLTextAreaElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const promptText = `
  فرض کن یک مربی بدنسازی حرفه‌ای هستی. یک برنامه تمرینی مناسب برای من بنویس.

  ## مشخصات من
  - سن: 
  - قد: 
  - وزن: 
  - میزان فعالیت روزانه:
  - سابقه ورزش:
  - مشکل یا بیماری خاص:

## جلسات
  یک برنامه بدنسازی بنویس که شامل ۴ جلسه باشد:
- جلسه ۱: سینه + پشت بازو
- جلسه ۲: پشت + لت + ساعد
- جلسه ۳: سرشانه + جلوبازو
- جلسه ۴: پا + شکم


## قوانین
از این قوانین پیروی کن:
۱. هر جلسه شامل تمرین‌هایی برای گروه عضلانی مشخص شده باشد، به‌طوری که هر گروه به طور کامل و متعادل درگیر شود.
۲. تعداد تمرین‌ها در هر جلسه حداقل ۵ تا ۷ حرکت باشد.
۳. تعداد ست‌ها و تکرارها متناسب با اصول هایپرتروفی باشد(مثلاً ۳ تا ۴ ست، ۸ تا ۱۵ تکرار).
۴. در تمریناتی مثل پلانک که تکرار معنا ندارد از توضیح مناسب استفاده کن(مثلا ۳ * ۱ دقیقه).
۵. تمرینات را فقط از لیست موجود در فایل exercises.ts که ارسال کردم انتخاب کن.
۶. امکان تعریف تمرین سوپرست نیز وجود دارد. مثل یک مربی حرفه‌ای در صورت نیاز یک تمرین سوپرست هم به برنامه اضافه کن.
۷. خروجی را در قالب یک فایل JSON طبق ساختار زیر بساز (با حفظ نام فیلد فقط مقدار را بنویس):

{
  "sessions": [
    {
      "id": "1765547003923",
      "name": "جلسه 1",
      "createdAt": "2025-12-12T13:43:23.923Z",
      "items": [
        {
          "type": "single",
          "exercise": {
            "exerciseId": "78",
            "completed": false,
            "notes": "12-10-8"
          }
        },
        {
          "type": "single",
          "exercise": {
            "exerciseId": "65",
            "completed": false,
            "notes": "3×12"
          }
        },
        {
          "type": "superset",
          "exercises": [
            {
              "exerciseId": "49",
              "completed": false,
              "notes": "3×10"
            },
            {
              "exerciseId": "62",
              "completed": false,
              "notes": "3×10"
            }
          ]
        }
      ]
    },
    {
      "id": "1765547007395",
      "name": "جلسه 2",
      "createdAt": "2025-12-12T13:43:27.395Z",
      "items": [
        {
          "type": "single",
          "exercise": {
            "exerciseId": "4",
            "completed": false,
            "notes": "4×10"
          }
        }
      ]
    }
  ]
}

`;

  const handleCopy = () => {
    if (promptTextRef.current) {
      promptTextRef.current.select();
      document.execCommand('copy');
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center space-x-3 space-x-reverse">
        <Bot className="h-7 w-7 text-gray-700 dark:text-gray-300" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ساخت برنامه با AI
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
          برای ساخت برنامه می‌توانید از هوش مصنوعی کمک بگیرید.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
          1. یکی از سرویس‌های هوش مصنوعی را باز کنید. مدل‌هایی مثل ChatGPT, Gemini و Grok در این زمینه عملکرد خوبی دارند.</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
          2. فایل <a href="https://github.com/fardm/tamrinsaz-next/blob/main/src/data/exercises.ts" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer"> exercises.ts </a> را دانلود کرده و در محیط چت آپلود کنید.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
          3. پرامپت زیر را کپی کنید. مشخصات خود را وارد کرده و ارسال کنید. برای گرفتن نتیجه دقیق‌تر می‌توانید حالت Deep Think را فعال کنید.
        </p>

        <div className="relative flex-grow rounded-lg bg-gray-100 dark:bg-gray-700 p-4 mb-4">
          <textarea
            ref={promptTextRef}
            readOnly
            value={promptText}
            className="w-full h-full bg-transparent text-gray-900 dark:text-white text-sm leading-relaxed resize-none outline-none border-none overflow-auto pr-10"
            style={{ minHeight: '200px', maxHeight: 'calc(90vh - 300px)' }}
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={copyStatus === 'copied' ? 'کپی شد!' : 'کپی به کلیپ بورد'}
          >
            {copyStatus === 'copied' ? (
              <span className="text-xs">کپی شد!</span>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
         4.  با این دستور یک کد JSON دریافت می‌کنید که از بخش «وارد کردن برنامه» می‌توانید آن را به سایت اضافه کنید.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right leading-relaxed">
          ℹ️ بر اساس نیاز خود می‌توانید تعداد جلسات، تمرین‌ها و تکرارها را در پرامپت تغییر دهید. اما ساختار خروجی حتما باید مانند کد نمونه باشد تا تمرین ساخته شده به سایت اضافه شود.
        </p>
      </div>
    </div>
  );
}