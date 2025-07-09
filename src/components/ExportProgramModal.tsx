import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy } from 'lucide-react';
import { exportUserData } from '../utils/storage';
import { UserData } from '../types';

interface ExportProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData; // User data to display and export
  showToast: (message: string, type: 'success' | 'delete') => void;
}

export function ExportProgramModal({ isOpen, onClose, userData, showToast }: ExportProgramModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const jsonDisplayRef = useRef<HTMLTextAreaElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Effect to handle closing modal on escape key or outside click
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
      document.body.style.overflow = 'hidden'; // Disable background scrolling
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.body.style.overflow = ''; // Re-enable scrolling on cleanup
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Convert userData to a pretty-printed JSON string
  const userDataJson = JSON.stringify(userData, null, 2);

  const handleCopy = () => {
    if (jsonDisplayRef.current) {
      jsonDisplayRef.current.select();
      document.execCommand('copy');
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleDownload = () => {
    exportUserData(); // This function already handles the download
    showToast('برنامه با موفقیت دانلود شد', 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span>دانلود برنامه</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right">
          این کد JSON حاوی تمام برنامه‌های تمرینی ذخیره شده شماست.
        </p>

        {/* JSON Display Box */}
        <div className="mb-4 relative flex-grow overflow-y-auto rounded-lg bg-gray-100 dark:bg-gray-700 p-4">
          <textarea
            ref={jsonDisplayRef}
            readOnly
            value={userDataJson}
            rows={10} // Set a default number of rows
            className="w-full h-full bg-transparent text-gray-900 dark:text-white text-sm leading-relaxed resize-none outline-none border-none overflow-auto pr-10"
            dir="ltr" // Ensure LTR direction for JSON code
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            aria-label={copyStatus === 'copied' ? 'کپی شد!' : 'کپی به کلیپ بورد'}
          >
            {copyStatus === 'copied' ? (
              <span className="text-xs">کپی شد!</span>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex space-x-3 space-x-reverse flex-shrink-0 mt-auto">
          <button
            onClick={handleDownload}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            دانلود
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