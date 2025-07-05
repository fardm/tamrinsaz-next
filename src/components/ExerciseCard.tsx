// src/components/ExerciseCard.tsx
import React from 'react';
import Link from 'next/link'; // تغییر از 'react-router-dom' به 'next/link'
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  sessionName?: string;
}

export function ExerciseCard({ exercise, sessionName }: ExerciseCardProps) {
  const defaultImage = 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400';

  // تابع برای گرفتن URL صحیح تصویر (محلی یا خارجی)
  const getImageUrl = (imageName: string | undefined) => {
    if (imageName) {
      if (imageName.startsWith('http')) { // اگر لینک خارجی است
        return imageName;
      } else { // اگر تصویر محلی است
        return `/images/${imageName}`; // مسیر جدید برای تصاویر در پوشه public
      }
    }
    return defaultImage; // بازگشت به تصویر پیش‌فرض اگر نام تصویر نامشخص است
  };

  return (
    <Link
      href={`/exercise/${exercise.id}`} // تغییر از `to` به `href`
      className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
    >
      <div className="relative">
        <img
          src={getImageUrl(exercise.image)} // استفاده از تابع جدید برای گرفتن URL تصویر
          alt={exercise.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        {sessionName && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {sessionName}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {exercise.name}
        </h3>

        <div className="flex flex-wrap gap-1 mb-2">
          {exercise.targetMuscles.map((muscle, index) => (
            <span
              key={index}
              className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full"
            >
              {muscle}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {exercise.equipment}
          </span>
        </div>
      </div>
    </Link>
  );
}