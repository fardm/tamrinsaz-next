// tamrinsaz-next/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // برای فایل‌های صفحه و layout در پوشه app
    './src/**/*.{js,ts,jsx,tsx,mdx}', // برای کامپوننت‌ها، هوکس‌ها، و بقیه فایل‌ها در src
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};