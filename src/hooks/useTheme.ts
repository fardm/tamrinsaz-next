// src/hooks/useTheme.ts
"use client"; // این خط رو اضافه کنید

import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    // اطمینان از اجرای کد فقط در سمت کلاینت
    if (typeof window === 'undefined') {
      return false; // یا مقدار پیش‌فرض دیگری برای سرور
    }
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // اطمینان از اجرای کد فقط در سمت کلاینت
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggleTheme: () => setIsDark(!isDark) };
}