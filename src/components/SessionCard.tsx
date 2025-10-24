// src/components/SessionCard.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WorkoutSession, Exercise, SessionExercise } from '../types';
import { Trash2, SquarePen, GripVertical, Eraser } from 'lucide-react'; 
import Link from 'next/link';
import Image from 'next/image';

interface SessionCardProps {
  session: WorkoutSession;
  exercises: Exercise[];
  onToggleExercise: (sessionId: string, exerciseId: string) => void;
  onRemoveExercise: (sessionId: string, exerciseId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  // پراپ جدید برای به‌روزرسانی ترتیب تمرینات
  onReorderExercises: (sessionId: string, reorderedExercises: SessionExercise[]) => void;
}

export function SessionCard({
  session,
  exercises,
  onToggleExercise,
  onRemoveExercise,
  onDeleteSession,
  onRenameSession,
  onReorderExercises // دریافت پراپ جدید
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);
  const [isDeleteExerciseModalOpen, setIsDeleteExerciseModalOpen] = useState(false);
  const [isDeleteSessionModalOpen, setIsDeleteSessionModalOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const deleteExerciseModalRef = useRef<HTMLDivElement>(null);
  const deleteSessionModalRef = useRef<HTMLDivElement>(null);

  // وضعیت برای ذخیره index آیتم در حال کشیدن
  const dragItem = useRef<number | null>(null);
  // وضعیت برای ذخیره index محل رها کردن (جایی که خط نشانگر نمایش داده می‌شود)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const completedCount = session.exercises.filter(ex => ex.completed).length;
  const totalCount = session.exercises.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSaveEdit = () => {
    if (editName.trim() && editName.trim() !== session.name) {
      onRenameSession(session.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = useCallback(() => {
    setEditName(session.name);
    setIsEditing(false);
  }, [session.name]);

  const handleOpenDeleteExerciseModal = (exerciseId: string) => {
    setExerciseToDelete(exerciseId);
    setIsDeleteExerciseModalOpen(true);
  };

  const handleConfirmDeleteExercise = () => {
    if (exerciseToDelete) {
      onRemoveExercise(session.id, exerciseToDelete);
    }
    setIsDeleteExerciseModalOpen(false);
    setExerciseToDelete(null);
  };

  const handleCancelDeleteExercise = useCallback(() => {
    setIsDeleteExerciseModalOpen(false);
    setExerciseToDelete(null);
  }, []);

  const handleOpenDeleteSessionModal = () => {
    setIsDeleteSessionModalOpen(true);
  };

  const handleConfirmDeleteSession = () => {
    onDeleteSession(session.id);
    setIsDeleteSessionModalOpen(false);
  };

  const handleCancelDeleteSession = useCallback(() => {
    setIsDeleteSessionModalOpen(false);
  }, []);

  const handleEditNameInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveEdit();
    }
  };

  // مدیریت رویدادهای کشیدن و رها کردن
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    // اضافه کردن کلاس برای نمایش بصری آیتم در حال کشیدن
    e.currentTarget.classList.add('opacity-50', 'shadow-lg', 'scale-[1.02]', 'z-10');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // ضروری برای فعال کردن drop
    // محاسبه محل رها کردن بر اساس موقعیت موس نسبت به آیتم
    const targetRect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const middleY = targetRect.top + targetRect.height / 2;

    if (mouseY < middleY) {
      setDropTargetIndex(index); // درج قبل از این آیتم
    } else {
      setDropTargetIndex(index + 1); // درج بعد از این آیتم
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // حذف کلاس‌های بصری از آیتم در حال کشیدن
    e.currentTarget.classList.remove('opacity-50', 'shadow-lg', 'scale-[1.02]', 'z-10');
    setDropTargetIndex(null); // پاک کردن نشانگر
    dragItem.current = null;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // جلوگیری از رفتار پیش‌فرض مرورگر
    setDropTargetIndex(null); // پاک کردن نشانگر بلافاصله پس از رها کردن

    if (dragItem.current === null || dropTargetIndex === null) return;

    const newExercises = [...session.exercises];
    const draggedExercise = newExercises[dragItem.current];

    // حذف آیتم کشیده شده از مکان قبلی
    newExercises.splice(dragItem.current, 1);

    // تنظیم index نهایی برای درج
    let finalDropIndex = dropTargetIndex;
    // اگر آیتم از یک index پایین‌تر به یک index بالاتر کشیده شود، index مقصد یک واحد کاهش می‌یابد
    if (dragItem.current < dropTargetIndex) {
      finalDropIndex--;
    }
    
    // اضافه کردن آیتم کشیده شده به مکان جدید
    newExercises.splice(finalDropIndex, 0, draggedExercise);

    // به‌روزرسانی ترتیب تمرینات در کامپوننت والد
    onReorderExercises(session.id, newExercises);

    dragItem.current = null;
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isEditing) handleCancelEdit();
        if (isDeleteExerciseModalOpen) handleCancelDeleteExercise();
        if (isDeleteSessionModalOpen) handleCancelDeleteSession();
      }
    };
    window.addEventListener('keydown', handleEsc);

    if (isEditing || isDeleteExerciseModalOpen || isDeleteSessionModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isEditing, isDeleteExerciseModalOpen, isDeleteSessionModalOpen, handleCancelEdit, handleCancelDeleteExercise, handleCancelDeleteSession]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && editModalRef.current && !editModalRef.current.contains(event.target as Node)) {
        handleCancelEdit();
      }
      if (isDeleteExerciseModalOpen && deleteExerciseModalRef.current && !deleteExerciseModalRef.current.contains(event.target as Node)) {
        handleCancelDeleteExercise();
      }
      if (isDeleteSessionModalOpen && deleteSessionModalRef.current && !deleteSessionModalRef.current.contains(event.target as Node)) {
        handleCancelDeleteSession();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, isDeleteExerciseModalOpen, isDeleteSessionModalOpen, handleCancelEdit, handleCancelDeleteExercise, handleCancelDeleteSession]);

  const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=100';

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {session.name}
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setIsEditing(true)}
            title="ویرایش جلسه"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <SquarePen className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenDeleteSessionModal}
            title="حذف جلسه"
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={editModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ویرایش نام جلسه
            </h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleEditNameInputKeyDown}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2 space-x-reverse">
              <button
                onClick={handleSaveEdit}
                className="w-full flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                تأیید
              </button>
              <button
                onClick={handleCancelEdit}
                className="w-full flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteExerciseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={deleteExerciseModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              این تمرین حذف شود؟
            </h2>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={handleConfirmDeleteExercise}
                className="w-full flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={handleCancelDeleteExercise}
                className="w-full flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteSessionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={deleteSessionModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              این جلسه حذف شود؟
            </h2>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={handleConfirmDeleteSession}
                className="w-full flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={handleCancelDeleteSession}
                className="w-full flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>پیشرفت</span>
          <span>{completedCount} از {totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {session.exercises.length > 0 ? (
          session.exercises.map((sessionExercise, index) => {
            const exercise = exercises.find(ex => ex.id === sessionExercise.exerciseId);
            if (!exercise) return null;

            return (
              <React.Fragment key={sessionExercise.exerciseId}>
                {/* خط نشانگر محل رها کردن */}
                {dropTargetIndex === index && (
                  <div className="h-1 bg-blue-500 my-1 rounded-full transition-all duration-200 ease-in-out"></div>
                )}
                <div
                  className={`exercise-card-draggable relative flex items-center space-x-2 space-x-reverse px-2 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex-wrap transition-all duration-200 ease-in-out
                    ${dragItem.current === index ? 'opacity-50 shadow-lg scale-[1.02] z-10' : ''}
                  `}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)} // استفاده از onDragOver برای بازخورد مداوم
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                >
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab flex-shrink-0" />

                  <div className="flex items-center ml-auto flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={sessionExercise.completed}
                      onChange={() => onToggleExercise(session.id, exercise.id)}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>


                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(exercise.image)}
                      alt={exercise.name}
                      fill
                      sizes="48px"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultImage;
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 mt-1 sm:mt-0">
                    <Link
                      href={`/exercise/${exercise.id}`}
                      className="text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 break-words"
                    >
                      {exercise.name}
                    </Link>
                    {sessionExercise.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-words">
                        {sessionExercise.notes}
                      </p>
                    )}
                  </div>



                  <button
                    onClick={() => handleOpenDeleteExerciseModal(exercise.id)}
                    title="حذف تمرین"
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                  >
                    <Eraser className="h-4 w-4" />
                  </button>
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            هنوز تمرینی اضافه نشده!
          </p>
        )}
        {/* خط نشانگر در انتهای لیست اگر به آنجا کشیده شود */}
        {dropTargetIndex === session.exercises.length && session.exercises.length > 0 && (
          <div className="h-1 bg-blue-500 my-1 rounded-full transition-all duration-200 ease-in-out"></div>
        )}
      </div>
    </div>
  );
}
