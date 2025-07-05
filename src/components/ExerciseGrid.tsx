import React from 'react';
import { ExerciseCard } from './ExerciseCard';
import { Exercise } from '../types';

interface ExerciseGridProps {
  exercises: Exercise[];
  getSessionName?: (exerciseId: string) => string | undefined;
}

export function ExerciseGrid({ exercises, getSessionName }: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          هیچ تمرینی یافت نشد
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          sessionName={getSessionName?.(exercise.id)}
        />
      ))}
    </div>
  );
}