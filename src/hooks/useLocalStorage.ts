// src/hooks/useLocalStorage.ts
"use client";

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void] {
  // مقدار اولیه را به طور یکسان برای سرور و کلاینت تنظیم کنید.
  // خواندن از localStorage به useEffect موکول می‌شود.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // این کد فقط در سمت کلاینت (پس از Hydration) اجرا می‌شود.
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item)); // به‌روزرسانی مقدار از localStorage
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}" in useEffect:`, error);
    }
  }, [key]); // وابسته به key

  const setValue = (value: T | ((val: T) => T)) => {
    // این کد فقط در سمت کلاینت اجرا می‌شود.
    if (typeof window === 'undefined') {
      console.warn("Attempted to set localStorage on server. Operation skipped.");
      return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}