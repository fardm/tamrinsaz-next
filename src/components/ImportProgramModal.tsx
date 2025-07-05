import React, { useRef, useEffect, useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { importUserData, saveUserData } from '../utils/storage';
import { UserData, WorkoutSession } from '../types'; // 'WorkoutSession' را هم ایمپورت کنید

interface ImportProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUserData: (data: UserData) => void;
  showToast: (message: string, type: 'success' | 'delete') => void;
}

export function ImportProgramModal({ isOpen, onClose, onUpdateUserData, showToast }: ImportProgramModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImportMethod, setSelectedImportMethod] = useState<'json' | 'file'>('json'); // State for selected import method

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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setJsonInput('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
      setSelectedImportMethod('json'); // Reset to JSON input as default
    }
  }, [isOpen]);

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input visually
    }
  };

  // Function to clear JSON input
  const handleClearJsonInput = () => {
    setJsonInput('');
  };

  const confirmImport = async () => {
    let dataToImport: UserData | null = null;

    if (selectedImportMethod === 'json' && jsonInput.trim()) {
      try {
        dataToImport = JSON.parse(jsonInput);
        // Basic validation for sessions structure
        if (!dataToImport || !Array.isArray(dataToImport.sessions)) {
          throw new Error('ساختار JSON نامعتبر است.');
        }
        // Convert date strings back to Date objects
        dataToImport.sessions = dataToImport.sessions.map((session: WorkoutSession) => ({ // <--- این خط اصلاح شد
          ...session,
          createdAt: new Date(session.createdAt || Date.now())
        }));
      } catch (error) {
        showToast('خطا در تجزیه JSON: ' + (error as Error).message, 'delete');
        return;
      }
    } else if (selectedImportMethod === 'file' && selectedFile) {
      try {
        dataToImport = await importUserData(selectedFile);
      } catch (error) {
        showToast('خطا در وارد کردن فایل: ' + (error as Error).message, 'delete');
        return;
      }
    } else {
      showToast('لطفاً کد JSON را وارد کنید یا یک فایل انتخاب کنید.', 'delete');
      return;
    }

    if (dataToImport) {
      saveUserData(dataToImport);
      onUpdateUserData(dataToImport);
      showToast('داده‌ها با موفقیت وارد شدند', 'success');
      onClose();
    }
  };

  const isImportDisabled = (selectedImportMethod === 'json' && !jsonInput.trim()) || (selectedImportMethod === 'file' && !selectedFile);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"> {/* Added px-4 here */}
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] flex flex-col" // Removed mx-4 here
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <Upload className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span>وارد کردن برنامه</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 text-right">
          می‌توانید کد JSON برنامه را مستقیماً وارد کنید یا یک فایل JSON را آپلود کنید.
        </p>

        {/* JSON Input Section */}
        <div className="mb-6">
          <label className="flex items-center text-sm font-medium text-gray-900 dark:text-white mb-2 cursor-pointer">
            <input
              type="radio"
              name="importMethod"
              value="json"
              checked={selectedImportMethod === 'json'}
              onChange={() => setSelectedImportMethod('json')}
              className="ml-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            کد JSON:
          </label>
          <div className="relative h-40"> {/* Fixed height for textarea */}
            <textarea
              id="json-input"
              value={jsonInput}
              onChange={handleJsonInputChange}
              placeholder='{ "sessions": [...] }'
              rows={8}
              dir="ltr"
              className={`w-full h-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none pr-10
                ${selectedImportMethod === 'json' ? 'border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-70'}`}
              disabled={selectedImportMethod !== 'json'}
            />
            {jsonInput.trim().length > 0 && selectedImportMethod === 'json' && (
              <button
                onClick={handleClearJsonInput}
                className="absolute top-3 right-3 p-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                aria-label="پاک کردن کد JSON"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="flex items-center text-sm font-medium text-gray-900 dark:text-white mb-2 cursor-pointer">
            <input
              type="radio"
              name="importMethod"
              value="file"
              checked={selectedImportMethod === 'file'}
              onChange={() => setSelectedImportMethod('file')}
              className="ml-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            آپلود فایل JSON:
          </label>
          <div className="flex items-center space-x-2 space-x-reverse bg-gray-100 dark:bg-gray-700 rounded-md p-2 w-full flex-nowrap" dir="ltr">
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className={`flex-grow text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 dark:file:bg-blue-800 dark:file:text-white dark:hover:file:bg-blue-900 min-w-0
                ${selectedImportMethod === 'file' ? '' : 'cursor-not-allowed opacity-70'}`}
              disabled={selectedImportMethod !== 'file'}
            />
            <button
              onClick={handleClearFile}
              disabled={!selectedFile || selectedImportMethod !== 'file'}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                !selectedFile || selectedImportMethod !== 'file'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
              }`}
              aria-label="حذف فایل انتخاب شده"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="text-sm text-blue-500 dark:text-blue-400 mb-6 text-right">
          ℹ️ داده‌های فعلی با داده‌های وارد شده جایگزین می‌شوند. این عملیات قابل بازگشت نیست.
        </p>

        <div className="flex space-x-3 space-x-reverse flex-shrink-0">
          <button
            onClick={confirmImport}
            disabled={isImportDisabled}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              isImportDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            تأیید
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