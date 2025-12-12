// src/app/my-workouts/page.tsx
"use client";

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, PanelRightOpen, PanelRightClose, Download, Upload, Trash2, HelpCircle, Bot } from 'lucide-react';
import { SessionCard } from '../../components/SessionCard';
import { exercisesData } from '../../data/exercises';
import { UserData, WorkoutSession, SessionExercise, SessionItem } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { saveUserData, clearUserData, getUserData, normalizeSession } from '../../utils/storage';

// ایمپورت پویا برای مودال‌ها
import dynamic from 'next/dynamic';

const NewSessionModal = dynamic(() => import('../../components/NewSessionModal').then(mod => mod.NewSessionModal), {
  ssr: false, // اطمینان از اینکه این کامپوننت فقط در سمت کلاینت بارگذاری شود.
});
const ImportProgramModal = dynamic(() => import('../../components/ImportProgramModal').then(mod => mod.ImportProgramModal), {
  ssr: false, // اطمینان از اینکه این کامپوننت فقط در سمت کلاینت بارگذاری شود.
});
const ExportProgramModal = dynamic(() => import('../../components/ExportProgramModal').then(mod => mod.ExportProgramModal), {
  ssr: false, // اطمینان از اینکه این کامپوننت فقط در سمت کلاینت بارگذاری شود.
});


// کامپوننت جداگانه برای مدیریت منطق useSearchParams.
const MyWorkoutsSearchParamHandler = ({ activeTab, setActiveTab, router }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  router: ReturnType<typeof useRouter>;
}) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const filterSessionIdFromUrl = searchParams.get('sessionId');
    if (filterSessionIdFromUrl) {
      if (activeTab !== filterSessionIdFromUrl) {
        setActiveTab(filterSessionIdFromUrl);
      }
      router.replace('/my-workouts');
    }
  }, [searchParams, activeTab, setActiveTab, router]);
  return null; // این کامپوننت چیزی رندر نمی‌کند.
};

// کامپوننت اصلی صفحه MyWorkoutsPage.
export default function MyWorkoutsPage() {
  const router = useRouter(); // هوک روتر Next.js.
  const [userData, setUserData] = useLocalStorage<UserData>('tamrinsaz-user-data', { sessions: [] }); // وضعیت داده‌های کاربر.
  const [activeTab, setActiveTab] = useLocalStorage<string>('workout-active-tab', 'all'); // وضعیت تب فعال (همه جلسات یا یک جلسه خاص).

  // مقدار اولیه isSidebarOpen را همیشه false قرار می‌دهیم تا از Hydration Mismatch جلوگیری شود.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // وضعیت باز یا بسته بودن سایدبار.

  // useEffect برای تنظیم وضعیت اولیه سایدبار بر اساس اندازه صفحه، فقط در سمت کلاینت.
  useEffect(() => {
    // این کد فقط در محیط مرورگر اجرا می‌شود.
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.matchMedia('(min-width: 768px)').matches);
    }
  }, []); // با [], این useEffect فقط یک بار پس از اولین رندر کلاینت اجرا می‌شود.

  useEffect(() => {
    setUserData(getUserData());
  }, [setUserData]);


  const sidebarRef = useRef<HTMLDivElement>(null); // رفرنس برای سایدبار.

  const [showNewSessionModal, setShowNewSessionModal] = useState(false); 
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false); 
  const [showExportProgramModal, setShowExportProgramModal] = useState(false);
  const [showImportProgramModal, setShowImportProgramModal] = useState(false); 
  const [toastMessage, setToastMessage] = useState<string | null>(null); 
  const [toastType, setToastType] = useState<'success' | 'delete' | null>(null);

  const clearModalRef = useRef<HTMLDivElement>(null); 
  const helpModalRef = useRef<HTMLDivElement>(null); 

  const normalizedUserData: UserData = useMemo(() => ({
    sessions: (userData.sessions || []).map(normalizeSession)
  }), [userData.sessions]);

  // تابع برای به‌روزرسانی داده‌های کاربر و ذخیره آن‌ها در localStorage.
  const handleUpdateUserData = (newData: UserData) => {
    saveUserData(newData);
    setUserData(newData);
  };

  // تابع برای تشخیص اینکه آیا دستگاه موبایل است یا خیر.
  const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

  // useEffect برای مدیریت بستن مودال‌ها و سایدبار با کلید Escape یا کلیک بیرون از آن‌ها.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        setShowNewSessionModal(false);
        setShowClearConfirm(false);
        setShowHelpModal(false);
        setShowExportProgramModal(false);
        setShowImportProgramModal(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile() && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
      if (clearModalRef.current && !clearModalRef.current.contains(event.target as Node)) {
        setShowClearConfirm(false);
      }
      if (helpModalRef.current && !helpModalRef.current.contains(event.target as Node)) {
        setShowHelpModal(false);
      }
    };

    // بررسی اینکه آیا هر یک از مودال‌ها باز هستند.
    const isAnyModalOpen = showNewSessionModal || showClearConfirm || showHelpModal || showExportProgramModal || showImportProgramModal;

    // اعمال overflow: hidden فقط در صورت باز بودن مودال‌ها یا باز بودن سایدبار در موبایل.
    if (isAnyModalOpen || (isSidebarOpen && isMobile())) {
      document.body.style.overflow = 'hidden'; // جلوگیری از اسکرول پس‌زمینه.
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = ''; // فعال کردن مجدد اسکرول پس‌زمینه.
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // پاکسازی event listenerها هنگام unmount شدن یا بسته شدن.
    return () => {
      document.body.style.overflow = ''; // اطمینان از فعال بودن اسکرول در زمان cleanup.
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, showNewSessionModal, showClearConfirm, showHelpModal, showExportProgramModal, showImportProgramModal]);

  // فیلتر کردن جلسات بر اساس تب فعال.
  const filteredSessions = normalizedUserData.sessions.filter(session => {
    if (activeTab === 'all') {
      return true;
    }
    return session.id === activeTab;
  });

  // تابع برای ایجاد جلسه جدید.
  const handleCreateSession = (sessionName: string) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: sessionName,
      items: [],
      createdAt: new Date()
    };

    handleUpdateUserData({
      sessions: [...normalizedUserData.sessions, newSession]
    });
    setShowNewSessionModal(false); // بستن مودال پس از ایجاد.
    setActiveTab(newSession.id); // فعال کردن تب جلسه جدید.
    showToast('جلسه با موفقیت ایجاد شد', 'success'); // نمایش پیام موفقیت.
  };

  // تابع برای تغییر وضعیت تکمیل شدن یک تمرین در جلسه.
  const handleToggleExercise = (sessionId: string, exerciseId: string) => {
    const updatedSessions = normalizedUserData.sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          items: session.items.map(item => {
            if (item.type === 'single' && item.exercise.exerciseId === exerciseId) {
              return { ...item, exercise: { ...item.exercise, completed: !item.exercise.completed } };
            }
            if (item.type === 'superset') {
              const updatedExercises = item.exercises.map(ex =>
                ex.exerciseId === exerciseId ? { ...ex, completed: !ex.completed } : ex
              ) as [SessionExercise, SessionExercise];
              return { ...item, exercises: updatedExercises };
            }
            return item;
          })
        };
      }
      return session;
    });

    handleUpdateUserData({ sessions: updatedSessions });
  };

  // تابع برای حذف یک آیتم از جلسه.
  const handleRemoveItem = (sessionId: string, itemIndex: number) => {
    const updatedSessions = normalizedUserData.sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          items: session.items.filter((_, idx) => idx !== itemIndex)
        };
      }
      return session;
    });

    handleUpdateUserData({ sessions: updatedSessions });
  };

  // تابع برای حذف یک جلسه کامل.
  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = normalizedUserData.sessions.filter(session => session.id !== sessionId);
    handleUpdateUserData({ sessions: updatedSessions });
    if (activeTab === sessionId) { // اگر تب فعال همان جلسه‌ای بود که حذف شد.
      setActiveTab('all'); // به تب "همه" برگرد.
    }
    showToast('جلسه با موفقیت حذف شد', 'delete'); // نمایش پیام حذف.
  };

  // تابع برای تغییر نام یک جلسه.
  const handleRenameSession = (sessionId: string, newName: string) => {
    const updatedSessions = normalizedUserData.sessions.map(session =>
      session.id === sessionId ? { ...session, name: newName } : session
    );
    handleUpdateUserData({ sessions: updatedSessions });
    showToast('نام جلسه با موفقیت تغییر یافت', 'success'); // نمایش پیام موفقیت.
  };

  // تابع جدید برای به‌روزرسانی ترتیب تمرینات در یک جلسه
  const handleReorderItems = (sessionId: string, reorderedItems: SessionItem[]) => {
    const updatedSessions = normalizedUserData.sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          items: reorderedItems
        };
      }
      return session;
    });
    handleUpdateUserData({ sessions: updatedSessions });
    showToast('ترتیب تمرینات با موفقیت ذخیره شد', 'success'); // نمایش پیام موفقیت
  };

  // تابع برای نمایش توست.
  const showToast = (message: string, type: 'success' | 'delete') => {
    setToastMessage(message);
    setToastType(type);
  };

  // useEffect برای پنهان کردن توست پس از ۳ ثانیه.
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
        setToastType(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // تابع برای پاک کردن تمام داده‌های کاربر.
  const handleClearData = () => {
    clearUserData();
    handleUpdateUserData({ sessions: [] });
    setShowClearConfirm(false); // بستن مودال تأیید.
    showToast('تمام داده‌ها پاک شدند', 'delete'); // نمایش پیام حذف.
  };

  // توابع برای باز کردن مودال‌های مختلف.
  const handleOpenImportProgramModal = () => {
    setShowImportProgramModal(true);
    if (isMobile()) setIsSidebarOpen(false); // بستن سایدبار در موبایل.
  };

  const handleOpenExportProgramModal = () => {
    setShowExportProgramModal(true);
    if (isMobile()) setIsSidebarOpen(false); // بستن سایدبار در موبایل.
  };

  const handleOpenHelpModal = () => {
    setShowHelpModal(true);
    if (isMobile()) setIsSidebarOpen(false); // بستن سایدبار در موبایل.
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      {/* Suspense Boundary برای MyWorkoutsSearchParamHandler */}
      <Suspense fallback={null}>
        <MyWorkoutsSearchParamHandler
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          router={router}
        />
      </Suspense>

      {/* دکمه باز کردن سایدبار در موبایل (پایین راست) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed bottom-[2.5rem] right-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg z-40 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="باز کردن منو"
        >
          <PanelRightOpen className="h-6 w-6" />
        </button>
      )}

      {/* دکمه باز کردن سایدبار در دسکتاپ (وسط راست) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:block fixed top-1/2 -translate-y-1/2 right-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg z-40 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="باز کردن پنل"
        >
          <PanelRightOpen className="h-6 w-6" />
        </button>
      )}

      {/* اورلی (Overlay) برای بستن سایدبار در موبایل با کلیک بیرون */}
      {isSidebarOpen && isMobile() && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* سایدبار (پنل سمت راست) */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 bottom-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-50 p-4 flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          md:top-0 md:h-full md:w-64 md:${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-end items-center mb-6">
          {/* دکمه بستن سایدبار در موبایل و دسکتاپ */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="بستن پنل"
          >
            <PanelRightClose className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="hidden md:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="بستن پنل"
          >
            <PanelRightClose className="h-6 w-6" />
          </button>
        </div>

        {/* منوی سایدبار */}
        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => { setShowNewSessionModal(true); if (isMobile()) setIsSidebarOpen(false); }}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>جلسه جدید</span>
          </button>
          <button
            onClick={handleOpenImportProgramModal}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>وارد کردن برنامه</span>
          </button>
          <button
            onClick={handleOpenExportProgramModal}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>دانلود برنامه</span>
          </button>
          <button
            onClick={() => { setShowClearConfirm(true); if (isMobile()) setIsSidebarOpen(false); }}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>حذف برنامه</span>
          </button>
          <br/>
          <hr/>
          <Link
            href="/ai-workout-generator"
            onClick={() => { if (isMobile()) setIsSidebarOpen(false); }}
            className="mt-8 w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Bot className="h-5 w-5" />
            <span>ساخت برنامه با AI</span>
          </Link>
          <button
            onClick={handleOpenHelpModal}
            className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-right text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>راهنما</span>
          </button>
        </nav>
      </div>

      {/* محتوای اصلی صفحه */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              برنامه من
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {normalizedUserData.sessions.length} جلسه تمرینی
            </p>
          </div>

          {/* تب‌های انتخاب جلسه (فقط در دسکتاپ) */}
          <div className="hidden md:flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-shrink-0 px-4 py-2 text-center text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === 'all'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              همه
            </button>
            {normalizedUserData.sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveTab(session.id)}
                className={`flex-shrink-0 px-4 py-2 text-center text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === session.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {session.name}
              </button>
            ))}
          </div>

          {/* دراپ‌داون انتخاب جلسه (فقط در موبایل) */}
          <div className="md:hidden mb-6">
            <label htmlFor="session-select" className="sr-only">انتخاب جلسه</label>
            <select
              id="session-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">همه جلسات</option>
              {normalizedUserData.sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* نمایش کارت‌های جلسه */}
          {filteredSessions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  exercises={exercisesData}
                  onToggleExercise={handleToggleExercise}
                  onRemoveItem={handleRemoveItem}
                  onDeleteSession={handleDeleteSession}
                  onRenameSession={handleRenameSession}
                  onReorderItems={handleReorderItems} // ارسال پراپ جدید
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                {activeTab === 'all'
                  ? 'هنوز جلسه‌ای ایجاد نشده!'
                  : 'هیچ تمرینی در این جلسه یافت نشد.'
                }
              </p>
              {activeTab === 'all' && (
                <p className="text-gray-400 dark:text-gray-500">
                  برای شروع، یک جلسه جدید ایجاد کنید و سپس از صفحه اصلی تمرینات را اضافه کنید
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* رندر مودال‌ها فقط در صورت نیاز (بارگذاری پویا) */}
      {showNewSessionModal && (
        <NewSessionModal
          isOpen={showNewSessionModal}
          onClose={() => setShowNewSessionModal(false)}
          onCreateSession={handleCreateSession}
        />
      )}

      {showImportProgramModal && (
        <ImportProgramModal
          isOpen={showImportProgramModal}
          onClose={() => setShowImportProgramModal(false)}
          onUpdateUserData={handleUpdateUserData}
          showToast={showToast}
        />
      )}

      {showExportProgramModal && (
        <ExportProgramModal
          isOpen={showExportProgramModal}
          onClose={() => setShowExportProgramModal(false)}
          userData={normalizedUserData}
          showToast={showToast}
        />
      )}

      {/* مودال تأیید حذف (Clear Confirm) */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={clearModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 space-x-reverse">
              <Trash2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span>حذف برنامه</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              با حذف برنامه تمامی جلسات و تمرینات شما حذف خواهد شد. این عمل قابل بازگشت نیست.
            </p>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={handleClearData}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={helpModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 space-x-reverse">
              <HelpCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span>راهنما</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-right">
              این سایت یک سایت استاتیک است و امکان ثبت‌نام یا ذخیره‌سازی دائمی اطلاعات شما را ندارد.
              تمام داده‌های شما فقط در مرورگر شما ذخیره می‌شوند و با پاک‌کردن تاریخچه (History) یا کش (Cache)، این اطلاعات نیز از بین می‌روند.
              <br /><br />
              برای نگهداری داده‌ها یا انتقال آن‌ها به مرورگر یا دستگاهی دیگر، لطفاً از گزینه «دانلود برنامه» استفاده کنید.
              با این کار، یک فایل JSON دریافت می‌کنید که می‌توانید آن را از طریق گزینه «وارد کردن برنامه» دوباره بارگذاری کرده و اطلاعات خود را بازیابی کنید.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* توست (Toast) برای نمایش پیام‌ها */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-md shadow-lg animate-fade-in-out ${
            toastType === 'success'
              ? 'bg-green-200 dark:bg-green-300 text-gray-800 dark:text-gray-900'
              : 'bg-red-200 dark:bg-red-300 text-gray-800 dark:text-gray-900'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
