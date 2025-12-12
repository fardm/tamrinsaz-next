// src/app/page.tsx
"use client"; // این خط برای استفاده از هوک‌های React ضروری است

import React, { useState, useMemo, useEffect, useRef, Suspense, useCallback } from 'react';
// SearchBar کامپوننت نوار جستجو است.
import { SearchBar } from '../components/SearchBar';
// ExerciseGrid کامپوننت نمایش شبکه‌ای تمرینات است.
import { ExerciseGrid } from '../components/ExerciseGrid';
// exercisesData شامل داده‌های تمرینات است.
import { exercisesData } from '../data/exercises';
// FilterRule و UserData تایپ‌های داده سفارشی هستند.
import { FilterRule, UserData } from '../types';
// آیکون Filter از lucide-react ایمپورت می‌شود.
import { Filter } from 'lucide-react';
// useLocalStorage هوک سفارشی برای مدیریت localStorage است.
import { useLocalStorage } from '../hooks/useLocalStorage';
// useSearchParams, useRouter, usePathname هوک‌های ناوبری Next.js هستند.
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// import { FilterPanel } from '../components/FilterPanel'; // ایمپورت اصلی حذف شد

// ایمپورت پویا برای FilterPanel
// این پنل فیلتر فقط زمانی که showFilterModal true شود، بارگذاری خواهد شد.
import dynamic from 'next/dynamic';
const FilterPanel = dynamic(() => import('../components/FilterPanel').then(mod => mod.FilterPanel), {
  ssr: false, // اطمینان از اینکه این کامپوننت فقط در سمت کلاینت بارگذاری شود.
});

const EXERCISES_PER_PAGE = 20; // تعداد تمرینات قابل نمایش در هر بار بارگذاری.

// کامپوننت جداگانه برای مدیریت useSearchParams در صفحه اصلی.
const HomePageSearchParamHandler = ({ setFilters, filters, router, pathname }: {
  setFilters: (filters: FilterRule[]) => void;
  filters: FilterRule[];
  router: ReturnType<typeof useRouter>;
  pathname: string;
}) => {
  const searchParams = useSearchParams(); // هوک برای دسترسی به پارامترهای URL.
  useEffect(() => {
    const filterField = searchParams.get('filterField'); // دریافت فیلد فیلتر از URL.
    const filterValue = searchParams.get('filterValue'); // دریافت مقدار فیلتر از URL.

    if (filterField && filterValue) {
      const decodedFilterValue = decodeURIComponent(filterValue); // دیکد کردن مقدار فیلتر.
      const newFilter: FilterRule = {
        id: Date.now().toString(), // تولید یک شناسه منحصر به فرد برای فیلتر.
        field: filterField as 'equipment' | 'targetMuscles' | 'type', // تعیین فیلد فیلتر. 'type' اضافه شد
        values: [decodedFilterValue], // تعیین مقدار فیلتر.
      };

      // بررسی اینکه آیا فیلتر قبلاً اعمال شده است یا خیر.
      const isFilterAlreadyApplied = filters.some(
        (f) => f.field === newFilter.field && f.values.includes(decodedFilterValue)
      );

      // اگر فیلتر قبلاً اعمال نشده باشد، آن را اضافه کن.
      if (!isFilterAlreadyApplied) {
        setFilters([newFilter]); 
      }

      // حذف پارامترهای URL پس از اعمال فیلتر برای تمیز کردن URL.
      router.replace(pathname); 
    }
  }, [searchParams, setFilters, router, pathname, filters]);
  return null; // این کامپوننت چیزی رندر نمی‌کند.
};


export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState(''); // وضعیت برای متن جستجو.
  const [filters, setFilters] = useLocalStorage<FilterRule[]>('tamrinsaz-filters', []); // وضعیت برای فیلترهای اعمال شده (ذخیره در localStorage).
  const [visibleExerciseCount, setVisibleExerciseCount] = useState(EXERCISES_PER_PAGE); // تعداد تمرینات قابل مشاهده.
  const [isLoading, setIsLoading] = useState(false); // وضعیت بارگذاری (برای Infinite Scroll).
  const loaderRef = useRef<HTMLDivElement>(null); // رفرنس برای عنصر لودر (برای Infinite Scroll).

  const [showFilterModal, setShowFilterModal] = useState(false); // وضعیت نمایش مودال فیلتر.
  const router = useRouter(); // هوک روتر Next.js.
  const pathname = usePathname(); // هوک برای دریافت مسیر فعلی.

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userData, setUserData] = useLocalStorage<UserData>('tamrinsaz-user-data', { sessions: [] }); // وضعیت داده‌های کاربر (ذخیره در localStorage).

  // تابع getSessionName به عنوان useCallback برای بهینه‌سازی.
  const getSessionName = useCallback((exerciseId: string): string | undefined => {
    if (!userData || !userData.sessions) return undefined;
    for (const session of userData.sessions) {
      const items = (session as any).items as any[];
      const exercises = (session as any).exercises as any[];

      if (Array.isArray(items)) {
        const foundInItems = items.some((item) => {
          if (item.type === 'single') return item.exercise?.exerciseId === exerciseId;
          if (item.type === 'superset') return item.exercises?.some((ex: any) => ex.exerciseId === exerciseId);
          return false;
        });
        if (foundInItems) return session.name;
      } else if (Array.isArray(exercises)) {
        // ساختار قدیمی برای پشتیبانی حداقلی
        if (exercises.some(ex => ex.exerciseId === exerciseId)) {
          return session.name;
        }
      } 
    }
    return undefined;
  }, [userData]); 

  // استفاده از useMemo برای بهینه‌سازی فیلتر و مرتب‌سازی تمرینات.
  const filteredAndSortedExercises = useMemo(() => {
    let result = [...exercisesData]; // کپی از داده‌های اصلی تمرینات.

    // اعمال فیلتر جستجو.
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(exercise =>
        exercise.name.toLowerCase().includes(searchLower) ||
        exercise.targetMuscles.some(muscle => muscle.toLowerCase().includes(searchLower)) ||
        exercise.equipment.toLowerCase().includes(searchLower) ||
        (exercise.type && exercise.type.toLowerCase().includes(searchLower)) || // فیلتر بر اساس نوع تمرین
        (exercise.otherNames && exercise.otherNames.toLowerCase().includes(searchLower))
      );
    }

    // اعمال فیلترهای انتخاب شده.
    filters.forEach(filter => {
      if (filter.values.length > 0) {
        result = result.filter(exercise => {
          if (filter.field === 'equipment') {
            return filter.values.includes(exercise.equipment);
          } else if (filter.field === 'targetMuscles') {
            return exercise.targetMuscles.some(muscle => filter.values.includes(muscle));
          } else if (filter.field === 'type') { // اعمال فیلتر برای نوع تمرین
            return exercise.type && filter.values.includes(exercise.type);
          }
          return true;
        });
      }
    });

    // در این نسخه، مرتب‌سازی خاصی اعمال نمی‌شود.
    // اگر نیاز به مرتب‌سازی پیش‌فرض دارید (مثلاً بر اساس نام)، می‌توانید اینجا اضافه کنید.
    result.sort((a, b) => a.name.localeCompare(b.name, 'fa', { sensitivity: 'base' }));


    return result;
  }, [searchTerm, filters]); 
  
  // تمریناتی که باید نمایش داده شوند (بر اساس visibleExerciseCount).
  const exercisesToShow = filteredAndSortedExercises.slice(0, visibleExerciseCount);
  // بررسی اینکه آیا تمرینات بیشتری برای بارگذاری وجود دارد یا خیر.
  const hasMoreExercises = filteredAndSortedExercises.length > exercisesToShow.length;

  // useEffect برای پیاده‌سازی Infinite Scroll با Intersection Observer.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreExercises && !isLoading) {
          setIsLoading(true); // شروع بارگذاری.
          setTimeout(() => { // تأخیر مصنوعی برای شبیه‌سازی بارگذاری.
            setVisibleExerciseCount(prevCount => prevCount + EXERCISES_PER_PAGE); // افزایش تعداد تمرینات قابل نمایش.
            setIsLoading(false); // پایان بارگذاری.
          }, 500);
        }
      },
      { threshold: 1.0 } // زمانی که لودر کاملاً در viewport قرار گرفت.
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef); // شروع مشاهده عنصر لودر.
    }

    // پاکسازی observer هنگام unmount شدن کامپوننت.
    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [hasMoreExercises, isLoading, loaderRef, setVisibleExerciseCount]);

  // محاسبه تعداد فیلترهای فعال
  const activeFilterCount = useMemo(() => {
    let count = 0;
    filters.forEach(filter => {
      // هر فیلتر می‌تواند شامل چندین مقدار باشد (مثلاً چندین عضله انتخاب شده).
      // بنابراین، طول آرایه values را جمع می‌کنیم.
      count += filter.values.length;
    });
    return count;
  }, [filters]);

  // بررسی اینکه آیا فیلتر فعالی وجود دارد یا خیر.
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Suspense Boundary برای HomePageSearchParamHandler */}
      <Suspense fallback={null}>
        <HomePageSearchParamHandler
          setFilters={setFilters}
          filters={filters}
          router={router}
          pathname={pathname}
        />
      </Suspense>

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
              {activeFilterCount} {/* اینجا از activeFilterCount استفاده می‌شود */}
            </span>
          )}
        </button>
      </div>

      <ExerciseGrid
        exercises={exercisesToShow}
        getSessionName={getSessionName}
      />

      {/* نمایش لودر یا پیام "در حال بارگذاری..." برای Infinite Scroll */}
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

      {/* رندر FilterPanel فقط در صورت نیاز (بارگذاری پویا) */}
      {showFilterModal && (
        <FilterPanel
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          currentFilters={filters}
          onApplyFilters={setFilters}
        />
      )}
    </div>
  );
}
