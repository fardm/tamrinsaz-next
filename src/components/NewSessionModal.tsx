// src/components/NewSessionModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (sessionName: string) => void;
}

export function NewSessionModal({ isOpen, onClose, onCreateSession }: NewSessionModalProps) {
  const [sessionName, setSessionName] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // مدیریت بستن مودال با کلید Escape یا کلیک بیرون از آن
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // جلوگیری از اسکرول پس‌زمینه
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.body.style.overflow = ''; // فعال کردن مجدد اسکرول پس‌زمینه
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // پاک کردن ورودی هنگام باز شدن مودال
  useEffect(() => {
    if (isOpen) {
      setSessionName('');
    }
  }, [isOpen]);

  // تابع ایجاد جلسه جدید
  const handleCreate = () => {
    if (sessionName.trim()) {
      onCreateSession(sessionName.trim());
      onClose();
    }
  };

  // مدیریت کلید Enter برای ایجاد جلسه
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ایجاد جلسه جدید
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="session-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            نام جلسه:
          </label>
          <input
            type="text"
            id="session-name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="جلسه ۱"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        <div className="flex space-x-3 space-x-reverse flex-shrink-0">
          <button
            onClick={handleCreate}
            disabled={!sessionName.trim()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ایجاد
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            لغو
          </button>
        </div>
      </div>
    </div>
  );
}
