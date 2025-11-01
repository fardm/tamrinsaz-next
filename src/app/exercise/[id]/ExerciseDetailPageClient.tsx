"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Plus, X, SquarePen, Eye, Eraser } from 'lucide-react';
import { exercisesData } from '../../../data/exercises';
import dynamic from 'next/dynamic';
import { UserData, WorkoutSession, SessionExercise } from '../../../types';
// import { muscleOptions, equipmentOptionsList, exerciseTypeOptions } from '../../../components/FilterPanel';
import { getUserData, saveUserData } from '../../../utils/storage';

const AddToWorkoutModal = dynamic(() => import('../../../components/AddToWorkoutModal').then(mod => mod.AddToWorkoutModal), { ssr: false });

const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800';

const getImageUrl = (imageName: string | undefined) => {
  if (imageName) {
    return imageName.startsWith('http') ? imageName : `/images/${imageName}`;
  }
  return defaultImage;
};

export default function ExerciseDetailPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionIdToDelete, setSessionIdToDelete] = useState<string | null>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [sessionBeingEdited, setSessionBeingEdited] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const editNotesModalRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<UserData>({ sessions: [] });

  // Data handling
  const handleUpdateUserData = (newData: UserData) => {
    saveUserData(newData);
    setUserData(newData);
  };

  useEffect(() => {
    setUserData(getUserData());
  }, []);

  // Modal handling
  const handleCancelEditNotes = useCallback(() => {
    setShowEditNotesModal(false);
    setSessionBeingEdited(null);
    setCurrentNotes('');
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        if (showDeleteModal) {
          setShowDeleteModal(false);
          setSessionIdToDelete(null);
        }
        if (showEditNotesModal) handleCancelEditNotes();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (showAddModal && document.getElementById('add-to-workout-modal-container') && !document.getElementById('add-to-workout-modal-container')?.contains(event.target as Node)) {
        setShowAddModal(false);
      }
      if (showDeleteModal && deleteModalRef.current && !deleteModalRef.current.contains(event.target as Node)) {
        setShowDeleteModal(false);
        setSessionIdToDelete(null);
      }
      if (showEditNotesModal && editNotesModalRef.current && !editNotesModalRef.current.contains(event.target as Node)) {
        handleCancelEditNotes();
      }
    };

    if (showAddModal || showDeleteModal || showEditNotesModal) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddModal, showDeleteModal, showEditNotesModal, handleCancelEditNotes]);

  // Exercise data
  const exercise = exercisesData.find(ex => ex.id === id);

  if (!exercise) {
    return (
      <div className="max-w-[35rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            تمرین یافت نشد
          </h1>
          <Link href="/" className="inline-flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </div>
    );
  }

  // Sessions with exercise
  const sessionsWithExercise = userData.sessions
    .map(session => {
      const sessionExercise = session.exercises.find(ex => ex.exerciseId === exercise.id);
      return sessionExercise ? { session, sessionExercise } : null;
    })
    .filter(Boolean) as { session: WorkoutSession; sessionExercise: SessionExercise }[];

  // Session management
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
          return { ...session, exercises: [...session.exercises, newExercise] };
        }
      }
      return session;
    });
    handleUpdateUserData({ sessions: updatedSessions });
  };

  const handleCreateNewSession = (sessionName: string) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: sessionName,
      exercises: [],
      createdAt: new Date()
    };
    handleUpdateUserData({ sessions: [...userData.sessions, newSession] });
  };

  const handleRemoveFromSession = (sessionId: string) => {
    setSessionIdToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const confirmRemoveFromSession = () => {
    if (sessionIdToDelete) {
      const updatedSessions = userData.sessions.map(session => {
        if (session.id === sessionIdToDelete) {
          return { ...session, exercises: session.exercises.filter(ex => ex.exerciseId !== exercise.id) };
        }
        return session;
      });
      handleUpdateUserData({ sessions: updatedSessions });
      setShowDeleteModal(false);
      setSessionIdToDelete(null);
    }
  };

  // Notes management
  const handleEditNotes = (sessionId: string, notes: string | undefined) => {
    setSessionBeingEdited(sessionId);
    setCurrentNotes(notes || '');
    setShowEditNotesModal(true);
  };

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

  const handleEditNotesInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveNotes();
    }
  };

  // Navigation helpers
  const handleMuscleClick = (muscleName: string) => {
    router.push(`/?filterField=targetMuscles&filterValue=${encodeURIComponent(muscleName)}`);
  };

  const handleEquipmentClick = (equipmentName: string) => {
    router.push(`/?filterField=equipment&filterValue=${encodeURIComponent(equipmentName)}`);
  };

  const handleExerciseTypeClick = (typeName: string) => {
    router.push(`/?filterField=type&filterValue=${encodeURIComponent(typeName)}`);
  };

  // Render
  return (
    <main className="grid grid-cols-1 md:grid-cols-6 gap-6 max-w-7xl mx-auto px-1 sm:px-2 lg:px-8 my-8">
      {/* Main Content */}
      <div className="col-span-1 md:col-span-4 rounded-lg space-y-6">
        {/* Title */}
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-fit">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{exercise.name}</h1>
          {exercise.otherNames && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{exercise.otherNames}</p>
          )}

          {/* Details */}
          <div className="flex flex-col divide-y-2 divide-gray-100 dark:divide-gray-200/10">
            {/* عضلات درگیر */}
            <div className="flex gap-1 py-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">عضلات درگیر:</h2>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle, index) => (
                  <button
                    key={index}
                    onClick={() => handleMuscleClick(muscle)}
                    className="text-blue-800 hover:text-blue-500 dark:text-blue-200 dark:hover:text-blue-100 bg-blue-100 hover:bg-blue-50 dark:bg-blue-900/40 hover:dark:bg-blue-800/70 rounded-full px-2"
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            </div>

            {/* وسایل */}
            <div className="flex gap-1 py-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">وسایل مورد نیاز:</h2>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment && (
                  <button
                    onClick={() => handleEquipmentClick(exercise.equipment)}
                    className="text-blue-800 hover:text-blue-500 dark:text-blue-200 dark:hover:text-blue-100 bg-blue-100 hover:bg-blue-50 dark:bg-blue-900/40 hover:dark:bg-blue-800/70 rounded-full px-2"
                  >
                    {exercise.equipment}
                  </button>
                )}
              </div>
            </div>

            {/* نوع تمرین */}
            {exercise.type && (
              <>
                <div className="flex gap-1 py-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">نوع تمرین:</h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleExerciseTypeClick(exercise.type!)}
                      className="text-blue-800 hover:text-blue-500 dark:text-blue-200 dark:hover:text-blue-100 bg-blue-100 hover:bg-blue-50 dark:bg-blue-900/40 hover:dark:bg-blue-800/70 rounded-full px-2"
                    >
                      {exercise.type}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {exercise.description && (
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">شرح تمرین</h2>
            <div
              className="text-gray-600 dark:text-gray-400 leading-relaxed [&_a]:text-blue-600 [&_a]:hover:text-blue-700 dark:[&_a]:text-blue-400 dark:[&_a]:hover:text-blue-300"
              dangerouslySetInnerHTML={{ __html: exercise.description }}
            />
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="col-span-1 md:col-span-2 p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-fit">
        <div className="relative aspect-video flex items-center justify-center rounded-lg overflow-hidden mb-8">
          <Image
            src={getImageUrl(exercise.image)}
            alt={exercise.name}
            fill
            sizes="(max-width: 768px) 100vw, 20rem"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse mb-8"
        >
          <Plus className="h-4 w-4" />
          <span>افزودن به برنامه</span>
        </button>
        {sessionsWithExercise.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">جلسات شامل این تمرین</h2>
            <div className="space-y-2">
              {sessionsWithExercise.map(({ session, sessionExercise }) => (
                <div key={session.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse text-gray-900 dark:text-white">
                      <span>{session.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse gap-2">
                      <Link href={`/my-workouts?sessionId=${session.id}`} title="مشاهده جلسه" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Eye className="h-5 w-5" />
                      </Link>
                      <button onClick={() => handleEditNotes(session.id, sessionExercise.notes)} title="ویرایش" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <SquarePen className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleRemoveFromSession(session.id)} title="حذف" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                        <Eraser className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {sessionExercise.notes && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">{sessionExercise.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
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
          <div ref={deleteModalRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">حذف جلسه</h3>
              <button onClick={() => { setShowDeleteModal(false); setSessionIdToDelete(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">تمرین از این جلسه حذف شود؟</p>
            <div className="flex space-x-2 space-x-reverse">
              <button onClick={confirmRemoveFromSession} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                حذف
              </button>
              <button onClick={() => { setShowDeleteModal(false); setSessionIdToDelete(null); }} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={editNotesModalRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ویرایش توضیحات تمرین</h3>
              <button onClick={handleCancelEditNotes} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
              <button onClick={handleSaveNotes} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                تأیید
              </button>
              <button onClick={handleCancelEditNotes} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}