// src/app/exercise/[id]/ExerciseDetailPageClient.tsx
"use client"; // این خط این فایل را به یک Client Component تبدیل می‌کند.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Plus, Check, X, SquarePen } from 'lucide-react';
import { exercisesData } from '../../../data/exercises';
// کامپوننت AddToWorkoutModal به صورت پویا ایمپورت می‌شود.
// import { AddToWorkoutModal } from '../../../components/AddToWorkoutModal'; // ایمپورت اصلی حذف شد
import { UserData, WorkoutSession, SessionExercise } from '../../../types';
import { ImageTextDisplay } from '../../../components/ImageTextDisplay';
import { muscleOptions, equipmentOptionsList, exerciseTypeOptions } from '../../../components/FilterPanel'; // exerciseTypeOptions اضافه شد
import { getUserData, saveUserData } from '../../../utils/storage';

// ایمپورت پویا برای AddToWorkoutModal این مودال فقط زمانی که showAddModal true شود، بارگذاری خواهد شد.
import dynamic from 'next/dynamic';
const AddToWorkoutModal = dynamic(() => import('../../../components/AddToWorkoutModal').then(mod => mod.AddToWorkoutModal), {
  ssr: false, // اطمینان از اینکه این کامپوننت فقط در سمت کلاینت بارگذاری شود.
});

// تعریف defaultImage و getImageUrl در خارج از کامپوننت برای جلوگیری از رندرهای غیرضروری.
const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800';

const getImageUrl = (imageName: string | undefined) => {
  if (imageName) {
    if (imageName.startsWith('http')) {
      return imageName;
    } else {
      return `/images/${imageName}`;
    }
  }
  return defaultImage;
};

// ExerciseDetailPageClient اکنون id را به عنوان prop دریافت می‌کند.
export default function ExerciseDetailPageClient({ id }: { id: string }) {
  const router = useRouter(); // هوک روتر Next.js
  const [showAddModal, setShowAddModal] = useState(false); // وضعیت نمایش مودال افزودن به برنامه
  const [showDeleteModal, setShowDeleteModal] = useState(false); // وضعیت نمایش مودال حذف تمرین از جلسه
  const [sessionIdToDelete, setSessionIdToDelete] = useState<string | null>(null); // شناسه جلسه‌ای که تمرین از آن حذف می‌شود.
  const deleteModalRef = useRef<HTMLDivElement>(null); // رفرنس برای مودال حذف.

  const [showEditNotesModal, setShowEditNotesModal] = useState(false); // وضعیت نمایش مودال ویرایش یادداشت‌ها.
  const [sessionBeingEdited, setSessionBeingEdited] = useState<string | null>(null); // شناسه جلسه‌ای که یادداشت‌های آن ویرایش می‌شود.
  const [currentNotes, setCurrentNotes] = useState<string>(''); // یادداشت‌های فعلی در حال ویرایش.
  const editNotesModalRef = useRef<HTMLDivElement>(null); // رفرنس برای مودال ویرایش یادداشت‌ها.

  const [userData, setUserData] = useState<UserData>({ sessions: [] }); // وضعیت داده‌های کاربر (شامل جلسات تمرینی).

  // تابع برای به‌روزرسانی داده‌های کاربر در localStorage و وضعیت کامپوننت.
  const handleUpdateUserData = (newData: UserData) => {
    saveUserData(newData);
    setUserData(newData);
  };

  // useEffect برای بارگذاری داده‌های کاربر هنگام mount شدن کامپوننت.
  useEffect(() => {
    setUserData(getUserData());
  }, []);

  // تابع useCallback برای لغو ویرایش یادداشت‌ها.
  const handleCancelEditNotes = useCallback(() => {
    setShowEditNotesModal(false);
    setSessionBeingEdited(null);
    setCurrentNotes('');
  }, []);

  // useEffect برای مدیریت بستن مودال‌ها با کلید Escape یا کلیک بیرون از آن‌ها.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        if (showDeleteModal) {
          setShowDeleteModal(false);
          setSessionIdToDelete(null);
        }
        if (showEditNotesModal) {
          handleCancelEditNotes();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // بررسی کلیک بیرون از مودال افزودن به برنامه.
      if (showAddModal &&
        (document.getElementById('add-to-workout-modal-container') && !document.getElementById('add-to-workout-modal-container')?.contains(event.target as Node))
      ) {
        setShowAddModal(false);
      }
      // بررسی کلیک بیرون از مودال حذف.
      if (
        showDeleteModal &&
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target as Node)
      ) {
        setShowDeleteModal(false);
        setSessionIdToDelete(null);
      }
      // بررسی کلیک بیرون از مودال ویرایش یادداشت‌ها.
      if (
        showEditNotesModal &&
        editNotesModalRef.current &&
        !editNotesModalRef.current.contains(event.target as Node)
      ) {
        handleCancelEditNotes();
      }
    };

    // اضافه کردن event listenerها در صورت باز بودن هر یک از مودال‌ها.
    if (showAddModal || showDeleteModal || showEditNotesModal) {
      document.body.style.overflow = 'hidden'; // جلوگیری از اسکرول پس‌زمینه.
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    // پاکسازی event listenerها هنگام unmount شدن یا بسته شدن مودال‌ها.
    return () => {
      document.body.style.overflow = ''; // فعال کردن مجدد اسکرول پس‌زمینه.
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddModal, showDeleteModal, showEditNotesModal, handleCancelEditNotes]);

  // پیدا کردن تمرین بر اساس id که به عنوان prop دریافت شده است.
  const exercise = exercisesData.find(ex => ex.id === id);

  // اگر تمرین یافت نشد، پیام "تمرین یافت نشد" را نمایش می‌دهد.
  if (!exercise) {
    return (
      <div className="max-w-[35rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            تمرین یافت نشد
          </h1>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </div>
    );
  }

  // فیلتر کردن جلساتی که شامل این تمرین هستند.
  const sessionsWithExercise = userData.sessions
    .map(session => {
      const sessionExercise = session.exercises.find(ex => ex.exerciseId === exercise.id);
      return sessionExercise ? { session, sessionExercise } : null;
    })
    .filter(Boolean) as { session: WorkoutSession; sessionExercise: SessionExercise }[];

  // تابع برای افزودن تمرین به جلسات انتخاب شده.
  const handleAddToSessions = (selectedSessionsData: { sessionId: string; notes: string }[]) => {
    const updatedSessions = userData.sessions.map(session => {
      const selectedSessionInfo = selectedSessionsData.find(s => s.sessionId === session.id);

      if (selectedSessionInfo) {
        const exerciseExists = session.exercises.some(ex => ex.exerciseId === exercise.id);
        if (!exerciseExists) {
          const newExercise: SessionExercise = {
            exerciseId: exercise.id,
            completed: false,
            notes: selectedSessionInfo.notes
          };
          return {
            ...session,
            exercises: [...session.exercises, newExercise]
          };
        }
      }
      return session;
    });

    handleUpdateUserData({ sessions: updatedSessions });
  };

  // تابع برای ایجاد جلسه جدید.
  const handleCreateNewSession = (sessionName: string) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: sessionName,
      exercises: [],
      createdAt: new Date()
    };

    handleUpdateUserData({
      sessions: [...userData.sessions, newSession]
    });
  };

  // تابع برای حذف تمرین از یک جلسه خاص.
  const handleRemoveFromSession = (sessionId: string) => {
    setSessionIdToDelete(sessionId);
    setShowDeleteModal(true);
  };

  // تابع برای تأیید حذف تمرین از جلسه.
  const confirmRemoveFromSession = () => {
    if (sessionIdToDelete) {
      const updatedSessions = userData.sessions.map(session => {
        if (session.id === sessionIdToDelete) {
          return {
            ...session,
            exercises: session.exercises.filter(ex => ex.exerciseId !== exercise.id)
          };
        }
        return session;
      });

      handleUpdateUserData({ sessions: updatedSessions });
      setShowDeleteModal(false);
      setSessionIdToDelete(null);
    }
  };

  // تابع برای باز کردن مودال ویرایش یادداشت‌ها.
  const handleEditNotes = (sessionId: string, notes: string | undefined) => {
    setSessionBeingEdited(sessionId);
    setCurrentNotes(notes || '');
    setShowEditNotesModal(true);
  };

  // تابع برای ذخیره یادداشت‌های ویرایش شده.
  const handleSaveNotes = () => {
    if (sessionBeingEdited && exercise) {
      const updatedSessions = userData.sessions.map(session => {
        if (session.id === sessionBeingEdited) {
          return {
            ...session,
            exercises: session.exercises.map(ex => 
              ex.exerciseId === exercise.id 
                ? { ...ex, notes: currentNotes.trim() || undefined }
                : ex
            )
          };
        }
        return session;
      });
      handleUpdateUserData({ sessions: updatedSessions });
      setShowEditNotesModal(false);
      setSessionBeingEdited(null);
      setCurrentNotes('');
    }
  };

  // مدیریت کلید Enter در ورودی ویرایش یادداشت‌ها.
  const handleEditNotesInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveNotes();
    }
  };

  // تابع برای دریافت نام تصویر عضله بر اساس نام نمایشی.
  const getMuscleImageName = (muscleDisplayName: string): string => {
    const muscle = muscleOptions.find(opt => opt.displayName === muscleDisplayName || opt.filterNames.includes(muscleDisplayName));
    return muscle ? muscle.imageName : 'placeholder.webp';
  };

  // تابع برای دریافت نام تصویر تجهیزات بر اساس نام نمایشی.
  const getEquipmentImageName = (equipmentDisplayName: string): string => {
    const equipment = equipmentOptionsList.find(opt => opt.displayName === equipmentDisplayName || opt.filterName === equipmentDisplayName);
    return equipment ? equipment.imageName : 'placeholder.webp';
  };

  // تابع جدید برای دریافت نام تصویر نوع تمرین
  const getExerciseTypeImageName = (typeDisplayName: string): string => {
    const typeOption = exerciseTypeOptions.find(opt => opt.displayName === typeDisplayName || opt.filterName === typeDisplayName);
    return typeOption ? typeOption.imageName : 'placeholder.webp';
  };

  // تابع برای ناوبری به صفحه اصلی با فیلتر عضله.
  const handleMuscleClick = (muscleName: string) => {
    router.push(`/?filterField=targetMuscles&filterValue=${encodeURIComponent(muscleName)}`);
  };

  // تابع برای ناوبری به صفحه اصلی با فیلتر تجهیزات.
  const handleEquipmentClick = (equipmentName: string) => {
    router.push(`/?filterField=equipment&filterValue=${encodeURIComponent(equipmentName)}`);
  };

  // تابع جدید برای ناوبری به صفحه اصلی با فیلتر نوع تمرین
  const handleExerciseTypeClick = (typeName: string) => {
    router.push(`/?filterField=type&filterValue=${encodeURIComponent(typeName)}`);
  };

  return (
    <div className="max-w-[35rem] mx-auto px-2 sm:px-6 lg:px-8 py-6">
      <div className="overflow-hidden">
        {/* اضافه کردن 'priority' به کامپوننت Image برای بهبود LCP */}
        <div className="relative aspect-video flex items-center justify-center bg-white dark:bg-white rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
          <Image
            src={getImageUrl(exercise.image)}
            alt={exercise.name}
            fill
            sizes="(max-width: 768px) 100vw, 35rem"
            style={{ objectFit: 'contain' }}
            priority // اضافه کردن پراپرتی priority
          />
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {exercise.name}
            </h1>
            {exercise.otherNames && (
              <p className="text-gray-600 dark:text-gray-400">
                {exercise.otherNames}
              </p>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              عضلات درگیر
            </h3>
            <div className="flex flex-wrap justify-start gap-4">
              {exercise.targetMuscles.map((muscle, index) => (
                <ImageTextDisplay
                  key={index}
                  text={muscle}
                  imageName={getMuscleImageName(muscle)}
                  altText={muscle}
                  onClick={handleMuscleClick}
                  filterValue={muscle}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              وسایل مورد نیاز
            </h3>
            <div className="flex flex-wrap justify-start">
              {exercise.equipment && (
                <ImageTextDisplay
                  text={exercise.equipment}
                  imageName={getEquipmentImageName(exercise.equipment)}
                  altText={exercise.equipment}
                  onClick={handleEquipmentClick}
                  filterValue={exercise.equipment}
                />
              )}
            </div>
          </div>

          {/* بخش جدید برای نمایش نوع تمرین */}
          {exercise.type && (
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                نوع تمرین
              </h3>
              <div className="flex flex-wrap justify-start">
                <ImageTextDisplay
                  text={exercise.type}
                  imageName={getExerciseTypeImageName(exercise.type)}
                  altText={exercise.type}
                  onClick={handleExerciseTypeClick}
                  filterValue={exercise.type}
                />
              </div>
            </div>
          )}

          {exercise.description && (
            <div className="mt-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                شرح تمرین
              </h3>
              <div
                className="text-gray-600 dark:text-gray-400 leading-relaxed [&_a]:text-blue-600 [&_a]:hover:text-blue-700 dark:[&_a]:text-blue-400 dark:[&_a]:hover:text-blue-300"
                dangerouslySetInnerHTML={{ __html: exercise.description }}
              />
            </div>
          )}

          {sessionsWithExercise.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                جلسات شامل این تمرین
              </h3>
              <div className="space-y-2">
                {sessionsWithExercise.map(({ session, sessionExercise }) => (
                  <div
                    key={session.id}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 space-x-reverse text-green-600 dark:text-green-400">
                        <Check className="h-5 w-5" />
                        <span>{session.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse gap-2">
                        <Link
                          href={`/my-workouts?sessionId=${session.id}`}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                        >
                          مشاهده جلسه
                        </Link>
                        <button
                          onClick={() => handleEditNotes(session.id, sessionExercise.notes)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <SquarePen className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromSession(session.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    {sessionExercise.notes && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                        {sessionExercise.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="h-4 w-4" />
              <span>افزودن به برنامه</span>
            </button>
          </div>
        </div>
      </div>

      {/* رندر AddToWorkoutModal فقط در صورت نیاز */}
      {showAddModal && (
        <AddToWorkoutModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          sessions={userData.sessions}
          onAddToSessions={handleAddToSessions}
          onCreateNewSession={handleCreateNewSession}
          exerciseId={exercise.id}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={deleteModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                حذف جلسه
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionIdToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              تمرین از این جلسه حذف شود؟
            </p>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={confirmRemoveFromSession}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionIdToDelete(null);
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={editNotesModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ویرایش توضیحات تمرین
              </h3>
              <button
                onClick={handleCancelEditNotes}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              onKeyDown={handleEditNotesInputKeyDown}
              placeholder="توضیحات تمرین..."
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={handleSaveNotes}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                تأیید
              </button>
              <button
                onClick={handleCancelEditNotes}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

