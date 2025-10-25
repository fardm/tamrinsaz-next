// src/components/Footer.tsx
import React from 'react';
import { Github, Send, Heart } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer dir="ltr" className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row space-y-2 justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 TamrinSaz.
          </p>
          <div className="flex space-x-3">

            <Link
              href="/donate"
              className="bg-red-50 dark:bg-red-400/20 hover:bg-red-100 dark:hover:bg-red-600/50 text-red-600 dark:text-red-200 hover:text-red-700 dark:hover:text-red-50 p-2 rounded-full transition-colors flex items-center"
              title="حمایت مالی"
            >
              <Heart className="h-5 w-5" />
              {/* <span>حمایت مالی</span> */}
            </Link>
            <a
              href="https://github.com/fardm/tamrinsaz-next"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 dark:bg-gray-700/70 hover:bg-gray-200 dark:hover:bg-gray-600/80 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full transition-colors flex items-center"
            >
              <Github className="h-5 w-5" />
              <span></span>
            </a>
            <a
              href="https://t.me/ifard_ir/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 dark:bg-gray-700/70 hover:bg-gray-200 dark:hover:bg-gray-600/80 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full transition-colors flex items-center"
            >
              <Send className="h-5 w-5" />
              <span></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}