// src/components/FilterPanel.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image'; // اضافه کردن ایمپورت Image
import { X, Check } from 'lucide-react';
import { FilterRule } from '../types';

// --- Muscle Options ---
export interface MuscleOption {
  id: string;
  displayName: string;
  filterNames: string[];
  imageName: string;
  type: 'normal' | 'advanced';
}

export const muscleOptions: MuscleOption[] = [
  { id: 'shoulder', displayName: 'سرشانه', filterNames: ['سرشانه'], imageName: 'shoulder.webp', type: 'normal' },
  { id: 'biceps', displayName: 'جلو بازو', filterNames: ['جلو بازو'], imageName: 'biceps.webp', type: 'normal' },
  { id: 'triceps', displayName: 'پشت بازو', filterNames: ['پشت بازو'], imageName: 'triceps.webp', type: 'normal' },
  { id: 'forearm', displayName: 'ساعد', filterNames: ['ساعد'], imageName: 'forearm.webp', type: 'normal' },
  { id: 'chest', displayName: 'سینه', filterNames: ['سینه'], imageName: 'chest.webp', type: 'normal' },
  { id: 'abs', displayName: 'شکم', filterNames: ['شکم'], imageName: 'abs.webp', type: 'normal' },
  { id: 'back', displayName: 'پشت', filterNames: ['پشت'], imageName: 'back.webp', type: 'normal' },
  { id: 'legs', displayName: 'پا', filterNames: ['پا'], imageName: 'legs.webp', type: 'normal' },
  { id: 'anterior_deltoid', displayName: 'دلتوئید قدامی', filterNames: ['دلتوئید قدامی'], imageName: 'anterior_deltoid.webp', type: 'advanced' },
  { id: 'lateral_deltoid', displayName: 'دلتوئید میانی', filterNames: ['دلتوئید میانی'], imageName: 'lateral_deltoid.webp', type: 'advanced' },
  { id: 'posterior_deltoid', displayName: 'دلتوئید خلفی', filterNames: ['دلتوئید خلفی'], imageName: 'posterior_deltoid.webp', type: 'advanced' },
  { id: 'lower_chest', displayName: 'زیر سینه', filterNames: ['زیر سینه'], imageName: 'lower_chest.webp', type: 'advanced' },
  { id: 'upper_chest', displayName: 'بالا سینه', filterNames: ['بالا سینه'], imageName: 'upper_chest.webp', type: 'advanced' },
  { id: 'upper_abs', displayName: 'بالا شکم', filterNames: ['بالا شکم'], imageName: 'upper_abs.webp', type: 'advanced' },
  { id: 'lower_abs', displayName: 'زیر شکم', filterNames: ['زیر شکم'], imageName: 'lower_abs.webp', type: 'advanced' },
  { id: 'obliques', displayName: 'مورب شکمی', filterNames: ['مورب شکمی'], imageName: 'obliques.webp', type: 'advanced' },
  { id: 'lats', displayName: 'لت', filterNames: ['لت'], imageName: 'lats.webp', type: 'advanced' },
  { id: 'traps', displayName: 'ذوزنقه‌ای', filterNames: ['ذوزنقه‌ای'], imageName: 'traps.webp', type: 'advanced' },
  { id: 'upper_traps', displayName: 'کول', filterNames: ['کول'], imageName: 'upper_traps.webp', type: 'advanced' },
  { id: 'lower_back', displayName: 'فیله کمر', filterNames: ['فیله کمر'], imageName: 'lower_back.webp', type: 'advanced' },
  { id: 'quadriceps', displayName: 'چهارسر ران', filterNames: ['چهارسر ران'], imageName: 'thigh.webp', type: 'advanced' },
  { id: 'inner_thigh', displayName: 'داخل ران', filterNames: ['داخل ران'], imageName: 'inner_thigh.webp', type: 'advanced' },
  { id: 'outer_thigh', displayName: 'خارج ران', filterNames: ['خارج ران'], imageName: 'outer_thigh.webp', type: 'advanced' },
  { id: 'hamstrings', displayName: 'همسترینگ', filterNames: ['همسترینگ'], imageName: 'hamstrings.webp', type: 'advanced' },
  { id: 'glutes', displayName: 'باسن', filterNames: ['باسن'], imageName: 'glutes.webp', type: 'advanced' },
  { id: 'calves', displayName: 'ساق پا', filterNames: ['ساق پا'], imageName: 'calves.webp', type: 'advanced' },
];

const parentToChildMapping: { [key: string]: string[] } = {
  'shoulder': ['anterior_deltoid', 'lateral_deltoid', 'posterior_deltoid'],
  'chest': ['lower_chest', 'upper_chest'],
  'abs': ['upper_abs', 'lower_abs', 'obliques'],
  'back': ['lats', 'traps', 'upper_traps', 'lower_back'],
  'legs': ['quadriceps', 'inner_thigh', 'outer_thigh', 'hamstrings', 'glutes', 'calves'],
};

// --- Equipment Options ---
export interface EquipmentOption {
  id: string;
  displayName: string;
  filterName: string;
  imageName: string;
}

export const equipmentOptionsList: EquipmentOption[] = [
  { id: 'dumbbell', displayName: 'دمبل', filterName: 'دمبل', imageName: 'dumbbell.webp' },
  { id: 'barbell', displayName: 'هالتر', filterName: 'هالتر', imageName: 'barbell.webp' },
  { id: 'plate_weight', displayName: 'صفحه وزنه', filterName: 'صفحه وزنه', imageName: 'plate_weight.webp' },
  { id: 'machine', displayName: 'دستگاه', filterName: 'دستگاه', imageName: 'machine.webp' },
  { id: 'cable', displayName: 'سیمکش', filterName: 'سیمکش', imageName: 'cable.webp' },
  { id: 'bench', displayName: 'نیمکت', filterName: 'نیمکت', imageName: 'bench.webp' },
  { id: 'bodyweight', displayName: 'بدون وسیله', filterName: 'بدون وسیله', imageName: 'bodyweight.webp' },
];

// --- Exercise Type Options ---
export interface ExerciseTypeOption {
  id: string;
  displayName: string;
  filterName: string;
  imageName: string;
}

export const exerciseTypeOptions: ExerciseTypeOption[] = [
  { id: 'strength', displayName: 'قدرتی', filterName: 'قدرتی', imageName: 'strength.webp' }, 
  { id: 'stretching', displayName: 'کششی', filterName: 'کششی', imageName: 'stretching.webp' }, 
  { id: 'cardio', displayName: 'هوازی', filterName: 'هوازی', imageName: 'cardio.webp' }, 
];


interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterRule[];
  onApplyFilters: (filters: FilterRule[]) => void;
}

export function FilterPanel({ isOpen, onClose, currentFilters, onApplyFilters }: FilterPanelProps) {
  const [activeTab, setActiveTab] = useState<'muscles' | 'equipment' | 'type'>('muscles'); // 'type' به تب‌های فعال اضافه شد
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [selectedMuscleIds, setSelectedMuscleIds] = useState<string[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [selectedExerciseTypeIds, setSelectedExerciseTypeIds] = useState<string[]>([]); // وضعیت جدید برای نوع تمرین
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const muscleFilter = currentFilters.find(f => f.field === 'targetMuscles');
      if (muscleFilter) {
        const initialSelected = muscleOptions.filter(option =>
          option.filterNames.some(name => muscleFilter.values.includes(name))
        ).map(option => option.id);
        setSelectedMuscleIds(initialSelected);
      } else {
        setSelectedMuscleIds([]);
      }

      const equipmentFilter = currentFilters.find(f => f.field === 'equipment');
      if (equipmentFilter) {
        const initialSelected = equipmentOptionsList.filter(option =>
          equipmentFilter.values.includes(option.filterName)
        ).map(option => option.id);
        setSelectedEquipmentIds(initialSelected);
      } else {
        setSelectedEquipmentIds([]);
      }

      // تنظیم وضعیت اولیه برای نوع تمرین
      const typeFilter = currentFilters.find(f => f.field === 'type');
      if (typeFilter) {
        const initialSelected = exerciseTypeOptions.filter(option =>
          typeFilter.values.includes(option.filterName)
        ).map(option => option.id);
        setSelectedExerciseTypeIds(initialSelected);
      } else {
        setSelectedExerciseTypeIds([]);
      }

    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, currentFilters]);

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
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const displayedMuscles = useMemo(() => {
    const result: MuscleOption[] = [];
    const normalMuscles = muscleOptions.filter(m => m.type === 'normal');
    const advancedMusclesMap = new Map<string, MuscleOption>(
      muscleOptions.filter(m => m.type === 'advanced').map(m => [m.id, m])
    );

    normalMuscles.forEach(normalMuscle => {
      result.push(normalMuscle);

      if (isAdvancedMode) {
        const childrenIds = parentToChildMapping[normalMuscle.id];
        if (childrenIds) {
          childrenIds.forEach(childId => {
            const childMuscle = advancedMusclesMap.get(childId);
            if (childMuscle) {
              result.push(childMuscle);
            }
          });
        }
      }
    });
    return result;
  }, [isAdvancedMode]);


  const getImageUrl = (imageName: string) => {
    return `/images/${imageName}`;
  };

  const toggleMuscleSelection = (muscleId: string) => {
    setSelectedMuscleIds(prev =>
      prev.includes(muscleId) ? prev.filter(id => id !== muscleId) : [...prev, muscleId]
    );
  };

  const toggleEquipmentSelection = (equipmentId: string) => {
    setSelectedEquipmentIds(prev =>
      prev.includes(equipmentId) ? prev.filter(id => id !== equipmentId) : [...prev, equipmentId]
    );
  };

  // تابع جدید برای مدیریت انتخاب نوع تمرین
  const toggleExerciseTypeSelection = (typeId: string) => {
    setSelectedExerciseTypeIds(prev =>
      prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
    );
  };

  const handleApplyFilters = () => {
    const newFilterRules: FilterRule[] = [];

    const tempMuscleValues: string[] = [];
    selectedMuscleIds.forEach(id => {
      const foundOption = muscleOptions.find(mo => mo.id === id);
      if (foundOption && foundOption.filterNames) {
        tempMuscleValues.push(...foundOption.filterNames);
      }
    });
    const uniqueMuscleFilterValues = Array.from(new Set(tempMuscleValues));

    if (uniqueMuscleFilterValues.length > 0) {
      newFilterRules.push({
        id: 'muscle-filter',
        field: 'targetMuscles',
        values: uniqueMuscleFilterValues,
      });
    }

    const tempEquipmentValues: string[] = [];
    selectedEquipmentIds.forEach(id => {
      const foundOption = equipmentOptionsList.find(eo => eo.id === id);
      if (foundOption && foundOption.filterName) {
        tempEquipmentValues.push(foundOption.filterName);
      }
    });
    const uniqueEquipmentFilterValues = Array.from(new Set(tempEquipmentValues));

    if (uniqueEquipmentFilterValues.length > 0) {
      newFilterRules.push({
        id: 'equipment-filter',
        field: 'equipment',
        values: uniqueEquipmentFilterValues,
      });
    }

    // اضافه کردن فیلتر نوع تمرین
    const tempExerciseTypeValues: string[] = [];
    selectedExerciseTypeIds.forEach(id => {
      const foundOption = exerciseTypeOptions.find(eto => eto.id === id);
      if (foundOption && foundOption.filterName) {
        tempExerciseTypeValues.push(foundOption.filterName);
      }
    });
    const uniqueExerciseTypeFilterValues = Array.from(new Set(tempExerciseTypeValues));

    if (uniqueExerciseTypeFilterValues.length > 0) {
      newFilterRules.push({
        id: 'type-filter',
        field: 'type',
        values: uniqueExerciseTypeFilterValues,
      });
    }

    onApplyFilters(newFilterRules);
    onClose();
  };

  const handleClearAll = () => {
    setSelectedMuscleIds([]);
    setSelectedEquipmentIds([]);
    setSelectedExerciseTypeIds([]); // پاک کردن انتخاب‌های نوع تمرین
    onApplyFilters([]);
  };

  if (!isOpen) return null;

  const isClearAllDisabled = selectedMuscleIds.length === 0 && selectedEquipmentIds.length === 0 && selectedExerciseTypeIds.length === 0; // به‌روزرسانی شرط غیرفعال بودن

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl md:max-w-4xl lg:max-w-5xl w-full max-h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">فیلتر تمرینات</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-start items-center mb-6 flex-shrink-0">
          <div className="flex flex-col items-center">
            <div
              dir="ltr"
              className={`relative inline-flex flex-shrink-0 h-8 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${isAdvancedMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              onClick={() => setIsAdvancedMode(prev => !prev)}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                  ${isAdvancedMode ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              پیشرفته
            </span>
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab('muscles')}
            className={`flex-1 py-2 text-center text-sm font-medium rounded-t-lg transition-colors
              ${activeTab === 'muscles'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            فیلتر عضلات
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-2 text-center text-sm font-medium rounded-t-lg transition-colors
              ${activeTab === 'equipment'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            فیلتر وسایل
          </button>
          {/* تب جدید برای نوع تمرین */}
          <button
            onClick={() => setActiveTab('type')}
            className={`flex-1 py-2 text-center text-sm font-medium rounded-t-lg transition-colors
              ${activeTab === 'type'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            نوع تمرین
          </button>
        </div>

        <div className="flex-grow overflow-y-auto px-2 -mr-2 h-[550px]">
          {activeTab === 'muscles' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 mb-6">
              {displayedMuscles.map(muscle => (
                <div
                  key={muscle.id}
                  className={`relative flex flex-col items-center p-2 border rounded-lg cursor-pointer transition-all duration-200
                    ${selectedMuscleIds.includes(muscle.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40'
                      : muscle.type === 'advanced'
                        ? 'border border-dashed border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  onClick={() => toggleMuscleSelection(muscle.id)}
                >
                  {/* استفاده از کامپوننت Image از next/image */}
                  {/* تغییر ابعاد کانتینر تصویر برای ریسپانسیو بودن */}
                  <div className="relative w-full max-w-[80px] aspect-square mb-2 rounded-lg bg-gray-200 dark:bg-gray-600 p-1 overflow-hidden">
                    <Image
                      src={getImageUrl(muscle.imageName)}
                      alt={muscle.displayName}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e0e0e0/000000?text=No+Image';
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-center text-gray-900 dark:text-white">
                    {muscle.displayName}
                  </span>
                  {selectedMuscleIds.includes(muscle.id) && (
                    <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 mb-6">
              {equipmentOptionsList.map(equipment => (
                <div
                  key={equipment.id}
                  className={`relative flex flex-col items-center p-2 border rounded-lg cursor-pointer transition-all duration-200
                    ${selectedEquipmentIds.includes(equipment.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  onClick={() => toggleEquipmentSelection(equipment.id)}
                >
                  {/* استفاده از کامپوننت Image از next/image */}
                  {/* تغییر ابعاد کانتینر تصویر برای ریسپانسیو بودن */}
                  <div className="relative w-full max-w-[80px] aspect-square mb-2 rounded-lg bg-gray-200 dark:bg-gray-600 p-1 overflow-hidden">
                    <Image
                      src={getImageUrl(equipment.imageName)}
                      alt={equipment.displayName}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e0e0e0/000000?text=No+Image';
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-center text-gray-900 dark:text-white">
                    {equipment.displayName}
                  </span>
                  {selectedEquipmentIds.includes(equipment.id) && (
                    <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* بخش جدید برای فیلتر نوع تمرین */}
          {activeTab === 'type' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 mb-6">
              {exerciseTypeOptions.map(typeOption => (
                <div
                  key={typeOption.id}
                  className={`relative flex flex-col items-center p-2 border rounded-lg cursor-pointer transition-all duration-200
                    ${selectedExerciseTypeIds.includes(typeOption.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  onClick={() => toggleExerciseTypeSelection(typeOption.id)}
                >
                  <div className="relative w-full max-w-[80px] aspect-square mb-2 rounded-lg bg-gray-200 dark:bg-gray-600 p-1 overflow-hidden">
                    <Image
                      src={getImageUrl(typeOption.imageName)}
                      alt={typeOption.displayName}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/e0e0e0/000000?text=No+Image';
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-center text-gray-900 dark:text-white">
                    {typeOption.displayName}
                  </span>
                  {selectedExerciseTypeIds.includes(typeOption.id) && (
                    <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6 flex-shrink-0">
          <div className="flex space-x-2 space-x-reverse w-full max-w-sm mx-auto">
            <button
              onClick={handleApplyFilters}
              className="w-40 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              تایید
            </button>
            <button
              onClick={handleClearAll}
              disabled={isClearAllDisabled}
              className={`w-40 px-4 py-2 rounded-lg transition-colors
                ${isClearAllDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-red-500 text-white hover:bg-red-600'
                }`}
            >
              پاک کردن همه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

