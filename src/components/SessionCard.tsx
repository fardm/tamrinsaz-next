// src/components/SessionCard.tsx
"use client"; // این خط رو اضافه کنید

import React, { useState, useEffect, useRef } from 'react';
import { WorkoutSession, Exercise } from '../types';
import { Trash2, Edit2, Check, X, SquarePen } from 'lucide-react';
import Link from 'next/link'; // تغییر: import Link از next/link

interface SessionCardProps {
  session: WorkoutSession;
  exercises: Exercise[];
  onToggleExercise: (sessionId: string, exerciseId: string) => void;
  onRemoveExercise: (sessionId: string, exerciseId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
}

export function SessionCard({
  session,
  exercises,
  onToggleExercise,
  onRemoveExercise,
  onDeleteSession,
  onRenameSession
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);
  const [isDeleteExerciseModalOpen, setIsDeleteExerciseModalOpen] = useState(false);
  const [isDeleteSessionModalOpen, setIsDeleteSessionModalOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const deleteExerciseModalRef = useRef<HTMLDivElement>(null);
  const deleteSessionModalRef = useRef<HTMLDivElement>(null);

  const completedCount = session.exercises.filter(ex => ex.completed).length;
  const totalCount = session.exercises.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSaveEdit = () => {
    if (editName.trim() && editName.trim() !== session.name) {
      onRenameSession(session.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(session.name);
    setIsEditing(false);
  };

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

  const handleCancelDeleteExercise = () => {
    setIsDeleteExerciseModalOpen(false);
    setExerciseToDelete(null);
  };

  const handleOpenDeleteSessionModal = () => {
    setIsDeleteSessionModalOpen(true);
  };

  const handleConfirmDeleteSession = () => {
    onDeleteSession(session.id);
    setIsDeleteSessionModalOpen(false);
  };

  const handleCancelDeleteSession = () => {
    setIsDeleteSessionModalOpen(false);
  };

  // Handle Esc key to close modals and disable/enable scrolling
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
      document.body.style.overflow = 'hidden'; // Disable background scrolling
    } else {
      document.body.style.overflow = ''; // Re-enable scrolling
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = ''; // Ensure scrolling is re-enabled on unmount/cleanup
    };
  }, [isEditing, isDeleteExerciseModalOpen, isDeleteSessionModalOpen]);

  // Handle click outside to close modals
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
  }, [isEditing, isDeleteExerciseModalOpen, isDeleteSessionModalOpen]);

  // Handle keyboard events for the edit session name input
  const handleEditNameInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveEdit();
    }
  };

  const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=100';

  // Function to get the correct image URL (local or external)
  const getImageUrl = (imageName: string | undefined) => {
    if (imageName) {
      if (imageName.startsWith('http')) { // If it's not an external link
        return imageName;
      } else { // If it's a local image
        return `/images/${imageName}`; // New path for images in public folder
      }
    }
    return defaultImage; // Fallback to default image on error
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Session Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {session.name}
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <SquarePen className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenDeleteSessionModal}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
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
              onKeyDown={handleEditNameInputKeyDown} // Added onKeyDown event listener
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

      {/* Delete Exercise Modal */}
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

      {/* Delete Session Modal */}
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

      {/* Progress Bar */}
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

      {/* Exercises List */}
      <div className="space-y-3">
        {session.exercises.map((sessionExercise) => {
          const exercise = exercises.find(ex => ex.id === sessionExercise.exerciseId);
          if (!exercise) return null;

          return (
            <div
              key={sessionExercise.exerciseId}
              className="relative flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex-wrap" // Added flex-wrap for small screens
            >
              {/* Delete Button */}
              <button
                onClick={() => handleOpenDeleteExerciseModal(exercise.id)}
                className="left-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Exercise Image */}
              <img
                src={getImageUrl(exercise.image)} // Use the new function to get image URL
                alt={exercise.name}
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultImage;
                }}
              />

              {/* Exercise Info */}
              <div className="flex-1 min-w-0 mt-1 sm:mt-0"> {/* Adjusted margin for responsiveness */}
                <Link
                  href={`/exercise/${exercise.id}`} // تغییر: href به جای to
                  className="text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 break-words"
                >
                  {exercise.name}
                </Link>
                <div className="flex flex-wrap gap-1 mt-1">
                  {/* {exercise.targetMuscles.slice(0, 2).map((muscle, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
                    >
                      {muscle}
                    </span>
                  ))} */}
                  {exercise.targetMuscles.length > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{exercise.targetMuscles.length - 2}
                    </span>
                  )}
                </div>
                {/* توضیحات */}
                {sessionExercise.notes && ( // Display notes if they exist
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-words">
                    {sessionExercise.notes}
                  </p>
                )}
              </div>

              {/* Checkbox */}
              <div className="flex items-center ml-auto"> {/* Aligned checkbox to the left */}
                <input
                  type="checkbox"
                  checked={sessionExercise.completed}
                  onChange={() => onToggleExercise(session.id, exercise.id)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          );
        })}

        {session.exercises.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            هنوز تمرینی اضافه نشده!
          </p>
        )}
      </div>
    </div>
  );
}