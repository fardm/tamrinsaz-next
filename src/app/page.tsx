// src/app/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SearchBar } from '../components/SearchBar';
import { ExerciseGrid } from '../components/ExerciseGrid';
import { exercisesData } from '../data/exercises';
import { FilterRule, SortRule, UserData } from '../types';
import { Filter } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FilterPanel } from '../components/FilterPanel';

const EXERCISES_PER_PAGE = 20;

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useLocalStorage<FilterRule[]>('tamrinsaz-filters', []);
  const [sortRules, setSortRules] = useState<SortRule[]>([]); // Keep this if SortPanel will be re-added
  const [visibleExerciseCount, setVisibleExerciseCount] = useState(EXERCISES_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [userData, setUserData] = useLocalStorage<UserData>('tamrinsaz-user-data', { sessions: [] }); // Keep setUserData as it might be used internally by useLocalStorage

  useEffect(() => {
    const filterField = searchParams.get('filterField');
    const filterValue = searchParams.get('filterValue');

    if (filterField && filterValue) {
      const decodedFilterValue = decodeURIComponent(filterValue);
      const newFilter: FilterRule = {
        id: Date.now().toString(),
        field: filterField as 'equipment' | 'targetMuscles',
        values: [decodedFilterValue],
      };

      const isFilterAlreadyApplied = filters.some(
        (f) => f.field === newFilter.field && f.values.includes(decodedFilterValue)
      );

      if (!isFilterAlreadyApplied) {
        setFilters([newFilter]);
      }

      router.replace(pathname);
    }
  }, [searchParams, setFilters, router, pathname, filters]);

  const getSessionName = (exerciseId: string): string | undefined => {
    if (!userData || !userData.sessions) return undefined;
    for (const session of userData.sessions) {
      if (session.exercises.some(ex => ex.exerciseId === exerciseId)) {
        return session.name;
      }
    }
    return undefined;
  };

  const filteredAndSortedExercises = useMemo(() => {
    let result = [...exercisesData];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(exercise =>
        exercise.name.toLowerCase().includes(searchLower) ||
        exercise.targetMuscles.some(muscle => muscle.toLowerCase().includes(searchLower)) ||
        exercise.equipment.toLowerCase().includes(searchLower) ||
        (exercise.otherNames && exercise.otherNames.toLowerCase().includes(searchLower))
      );
    }

    filters.forEach(filter => {
      if (filter.values.length > 0) {
        result = result.filter(exercise => {
          if (filter.field === 'equipment') {
            return filter.values.includes(exercise.equipment);
          } else if (filter.field === 'targetMuscles') {
            return exercise.targetMuscles.some(muscle => filter.values.includes(muscle));
          }
          return true;
        });
      }
    });

    if (sortRules.length > 0) {
      result.sort((a, b) => {
        for (const rule of sortRules) {
          let comparison = 0;
          
          if (rule.field === 'name') {
            comparison = a.name.localeCompare(b.name, 'fa');
          } else if (rule.field === 'equipment') {
            comparison = a.equipment.localeCompare(b.equipment, 'fa');
          } else if (rule.field === 'targetMuscles') {
            comparison = a.targetMuscles[0]?.localeCompare(b.targetMuscles[0] || '', 'fa') || 0;
          }

          if (comparison !== 0) {
            return rule.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    setVisibleExerciseCount(EXERCISES_PER_PAGE);

    return result;
  }, [searchTerm, filters, sortRules]);
  
  const exercisesToShow = filteredAndSortedExercises.slice(0, visibleExerciseCount);
  const hasMoreExercises = filteredAndSortedExercises.length > exercisesToShow.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreExercises && !isLoading) {
          setIsLoading(true);
          setTimeout(() => {
            setVisibleExerciseCount(prevCount => prevCount + EXERCISES_PER_PAGE);
            setIsLoading(false);
          }, 500);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoaderRef = loaderRef.current; // Copy ref value to a variable for cleanup
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) { // Use the copied variable in cleanup
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [hasMoreExercises, isLoading, loaderRef]); // Add loaderRef to dependencies

  const hasActiveFilters = filters.some(f => f.values.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          تمرینات
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredAndSortedExercises.length} تمرین یافت شد
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="جستجوی تمرینات..."
        />

        <button
          onClick={() => setShowFilterModal(true)}
          className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg border transition-colors ${
            hasActiveFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>فیلتر</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {filters.length}
            </span>
          )}
        </button>

        {/* <SortPanel
          sortRules={sortRules}
          onSortRulesChange={setSortRules}
        /> */}
      </div>

      <ExerciseGrid
        exercises={exercisesToShow}
        getSessionName={getSessionName}
      />

      {hasMoreExercises && (
        <div ref={loaderRef} className="flex justify-center mt-8">
          {isLoading ? (
            <div className="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-400">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>در حال بارگذاری...</span>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400"></div>
          )}
        </div>
      )}

      <FilterPanel
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilters={filters}
        onApplyFilters={setFilters}
      />
    </div>
  );
}