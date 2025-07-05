// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  // مقدار اولیه تم را null قرار می‌دهیم تا در رندر اولیه سمت سرور،
  // هیچ تمی از localStorage بارگذاری نشود و از Hydration Mismatch جلوگیری شود.
  const [theme, setTheme] = useState<Theme | null>(null);

  // useEffect برای بارگذاری تم از localStorage فقط در سمت کلاینت
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []); // این useEffect فقط یک بار در زمان mount کامپوننت اجرا می‌شود

  // useEffect برای اعمال کلاس 'dark' یا 'light' به تگ <html>
  useEffect(() => {
    if (theme !== null) { // فقط زمانی که تم واقعی از localStorage بارگذاری شد
      const root = window.document.documentElement;
      // ابتدا کلاس‌های قبلی را حذف می‌کنیم تا از تداخل جلوگیری شود
      root.classList.remove('light', 'dark'); 
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]); // هر زمان که theme تغییر کرد، این useEffect اجرا می‌شود

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // تا زمانی که تم از localStorage بارگذاری نشده، یک تم پیش‌فرض (مثلاً 'light') برگردانده شود
  // یا می‌توانید null برگردانید و UI را بر اساس آن مدیریت کنید.
  // برای جلوگیری از مشکلات رندرینگ، بهتر است یک مقدار پیش‌فرض معقول داشته باشیم.
  return { isDark: theme === 'dark', toggleTheme, theme };
};
