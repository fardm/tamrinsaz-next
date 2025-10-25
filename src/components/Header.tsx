// src/components/Header.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Menu, Bot, ClipboardList, X, Github, Send, Heart } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function Header() {
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileMenu(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showMobileMenu]);

  const getMenuItemClass = (path: string) => {
    return `w-full px-4 py-2 text-right text-base font-medium flex items-center space-x-3 space-x-reverse transition-colors
            ${
              pathname === path
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Site Title */}
          <Link href="/" className="flex items-center space-x-2 space-x-reverse hover:opacity-80 transition-opacity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="#3B82F6"/><path d="M8 12h4v8H8v-8zm12 0h4v8h-4v-8zm-6-4h4v16h-4V8z" fill="white"/></svg>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تمرین‌ساز</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3 space-x-reverse">
            <Link href="/my-workouts">
              <button
                className="bg-gray-100 dark:bg-gray-700/70 p-2 rounded-lg text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2 space-x-reverse"
                aria-label="برنامه من"
              >
                <ClipboardList className="h-5 w-5" />
                <span>برنامه‌من</span>
              </button>
            </Link>


            {/* <Link
              href="/donate"
              className="bg-gray-100 dark:bg-gray-700/70 p-2 rounded-lg text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <Heart className="h-5 w-5" />
              <span>حمایت مالی</span>
            </Link> */}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="bg-gray-100 dark:bg-gray-700/70 p-2 rounded-lg text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDark ? 'حالت روشن' : 'حالت تیره'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </nav>

          {/* Mobile Navigation Buttons */}
          <div className="flex items-center space-x-3 space-x-reverse md:hidden">
            <button
              onClick={toggleTheme}
              className="bg-gray-100 dark:bg-gray-700/70 p-2 rounded-lg text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDark ? 'حالت روشن' : 'حالت تیره'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="منوی کاربر"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {showMobileMenu && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            ></div>
          )}

          {/* Mobile Menu Content */}
          <div
            ref={mobileMenuRef}
            className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg py-4 z-50 flex flex-col transition-transform duration-300 ease-in-out
              ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
          >
            <div className="flex justify-end items-center px-4 mb-4">
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="بستن منو"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex justify-between flex-col space-y-1 px-4 overflow-y-auto flex-1">
              <div>
                <Link
                  href="/"
                  onClick={() => setShowMobileMenu(false)}
                  className={getMenuItemClass('/')}
                >
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="currentColor"/>
                    <path d="M8 12h4v8H8v-8zm12 0h4v8h-4v-8zm-6-4h4v16h-4V8z" fill="white"/>
                  </svg>
                  <span>خانه</span>
                </Link>
                <Link
                  href="/my-workouts"
                  onClick={() => setShowMobileMenu(false)}
                  className={`${getMenuItemClass('/my-workouts')} border-b border-gray-200 dark:border-gray-700`}
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>برنامه‌من</span>
                </Link>
                <Link
                  href="/ai-workout-generator"
                  onClick={() => setShowMobileMenu(false)}
                  className={getMenuItemClass('/ai-workout-generator')}
                >
                  <Bot className="h-5 w-5" />
                  <span>ساخت برنامه با AI</span>
                </Link>

                <Link
                  href="/donate"
                  onClick={() => setShowMobileMenu(false)}
                  className={getMenuItemClass('/donate')}
                >
                  <Heart className="h-5 w-5" />
                  <span>حمایت مالی</span>
                </Link>
              </div>

              {/* Mobile Menu Footer Section */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-start space-x-3 space-x-reverse mt-4 px-4 pb-4">
                  <a
                    href="https://github.com/fardm"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href="https://t.me/ifard_ir/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="Telegram"
                  >
                    <Send className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}