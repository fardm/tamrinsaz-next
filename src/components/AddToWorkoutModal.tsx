import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X } from 'lucide-react';
import { WorkoutSession } from '../types';
import { exercisesData } from '../data/exercises';

interface AddToWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: WorkoutSession[];
  // Updated onAddToSessions to pass selected session IDs along with notes for the exercise
  onAddToSessions: (selectedSessions: { sessionId: string; notes: string; partnerNotes?: string; mode: 'single' | 'superset'; partnerExerciseId?: string }[]) => void;
  // onCreateNewSession no longer receives exerciseNotes as the exercise is not added immediately
  onCreateNewSession: (sessionName: string) => void;
  exerciseId: string;
}

export function AddToWorkoutModal({
  isOpen,
  onClose,
  sessions,
  onAddToSessions,
  onCreateNewSession,
  exerciseId
}: AddToWorkoutModalProps) {
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [exerciseNotes, setExerciseNotes] = useState(''); // State for exercise notes
  const [partnerNotes, setPartnerNotes] = useState('');
  const [mode, setMode] = useState<'single' | 'superset'>('single');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  const availableSessions = sessions;

  const handleAddToSelected = () => {
    if (!selectedSession) return;
    if (mode === 'superset' && !selectedPartnerId) return;

    const sessionsToAdd = [
      {
        sessionId: selectedSession,
        notes: exerciseNotes,
        partnerNotes: isSupersetMode ? partnerNotes : undefined,
        mode,
        partnerExerciseId: mode === 'superset' ? selectedPartnerId ?? undefined : undefined
      }
    ];
    onAddToSessions(sessionsToAdd);
    setSelectedSession('');
    setExerciseNotes('');
    setPartnerNotes('');
    setSelectedPartnerId(null);
    setPartnerSearch('');
    setMode('single');
    onClose(); // Close modal after adding exercise
  };

  const isAnySessionSelected = !!selectedSession;
  const isSupersetMode = mode === 'superset';

  const partnerOptions = useMemo(
    () =>
      exercisesData
        .filter(
          (exercise) =>
            exercise.id !== exerciseId &&
            exercise.name.toLowerCase().includes(partnerSearch.toLowerCase())
        )
        .slice(0, 10),
    [exerciseId, partnerSearch]
  );

  const sessionExerciseCount = (session: WorkoutSession) => {
    const items = Array.isArray((session as any).items) ? (session as any).items : [];
    const legacyExercises = Array.isArray((session as any).exercises) ? (session as any).exercises : [];

    if (items.length > 0) {
      return items.reduce((acc: number, item: any) => acc + (item.type === 'single' ? 1 : 2), 0);
    }

    return legacyExercises.length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        // Main modal container: uses flex-col to stack children vertically
        // Adjusted max-height to ensure it doesn't overflow the viewport and allows internal scrolling
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header - flex-shrink-0 ensures it doesn't shrink */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            افزودن به برنامه
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">نوع تمرین</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                <input
                  type="radio"
                  name="add-mode"
                  value="single"
                  checked={mode === 'single'}
                  onChange={() => setMode('single')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                سینگل‌ست
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                <input
                  type="radio"
                  name="add-mode"
                  value="superset"
                  checked={mode === 'superset'}
                  onChange={() => setMode('superset')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                سوپرست
              </label>
            </div>
          </div>

          {/* Session select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">انتخاب جلسه</label>
            {availableSessions.length > 0 ? (
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">یک جلسه را انتخاب کنید</option>
                {availableSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                جلسه‌ای پیدا نشد. از صفحه برنامه من جلسه جدید بسازید.
              </p>
            )}
          </div>

          {isSupersetMode && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                تمرین دوم سوپرست را انتخاب کنید
              </label>
              <input
                type="text"
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                placeholder="جستجو..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="max-h-40 overflow-y-auto space-y-2">
                {partnerOptions.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">تمرینی یافت نشد.</p>
                )}
                {partnerOptions.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedPartnerId(exercise.id)}
                    className={`w-full text-right px-3 py-2 rounded-lg border transition-colors ${
                      selectedPartnerId === exercise.id
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {exercise.name}
                  </button>
                ))}
              </div>
              {selectedPartnerId && (
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  <span>انتخاب شده: {exercisesData.find(ex => ex.id === selectedPartnerId)?.name}</span>
                  <button
                    className="text-red-500 hover:text-red-600"
                    onClick={() => setSelectedPartnerId(null)}
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {!isSupersetMode ? (
            <div className="space-y-2">
              <label htmlFor="exercise-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ست و تکرار
              </label>
              <input
                type="text"
                dir="ltr"
                id="exercise-notes"
                value={exerciseNotes}
                onChange={(e) => setExerciseNotes(e.target.value)}
                placeholder="3×12"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${isAnySessionSelected ? 'border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`}
                disabled={!isAnySessionSelected}
                readOnly={!isAnySessionSelected}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="exercise-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ست و تکرار تمرین فعلی
                </label>
                <input
                  type="text"
                  dir="ltr"
                  id="exercise-notes"
                  value={exerciseNotes}
                  onChange={(e) => setExerciseNotes(e.target.value)}
                  placeholder="3×12"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${isAnySessionSelected ? 'border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`}
                  disabled={!isAnySessionSelected}
                  readOnly={!isAnySessionSelected}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="partner-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ست و تکرار تمرین دوم
                </label>
                <input
                  type="text"
                  dir="ltr"
                  id="partner-notes"
                  value={partnerNotes}
                  onChange={(e) => setPartnerNotes(e.target.value)}
                  placeholder="3×12"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${isAnySessionSelected ? 'border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`}
                  disabled={!isAnySessionSelected}
                  readOnly={!isAnySessionSelected}
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAddToSelected}
          disabled={
            !isAnySessionSelected || (isSupersetMode && !selectedPartnerId)
          } // Disable if requirements not met
          className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {isSupersetMode ? 'افزودن سوپرست' : 'افزودن'}
        </button>
      </div>
    </div>
  );
}