import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpDown, X, MoveUp, MoveDown } from 'lucide-react';
import { SortRule } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SortPanelProps {
  sortRules: SortRule[];
  onSortRulesChange: (rules: SortRule[]) => void;
}

export function SortPanel({ sortRules, onSortRulesChange }: SortPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Local state for sort rules within the modal until applied
  const [tempSortRules, setTempSortRules] = useState<SortRule[]>([]);
  // State to manage whether each field is enabled for sorting
  const [isNameSortEnabled, setIsNameSortEnabled] = useState(false);
  const [isEquipmentSortEnabled, setIsEquipmentSortEnabled] = useState(false);
  const [isMusclesSortEnabled, setIsMusclesSortEnabled] = useState(false);

  // Load stored sort rules on initial render
  const [storedSortRules, setStoredSortRules] = useLocalStorage<SortRule[]>('tamrinsaz-sort-rules', []);

  useEffect(() => {
    // When component mounts, apply stored sort rules
    if (storedSortRules.length > 0) {
      onSortRulesChange(storedSortRules);
      // Initialize enabled states based on stored rules
      setIsNameSortEnabled(storedSortRules.some(r => r.field === 'name'));
      setIsEquipmentSortEnabled(storedSortRules.some(r => r.field === 'equipment'));
      setIsMusclesSortEnabled(storedSortRules.some(r => r.field === 'targetMuscles'));
    }
  }, []);

  useEffect(() => {
    // Sync external sortRules prop to stored rules whenever it changes
    setStoredSortRules(sortRules);
  }, [sortRules, setStoredSortRules]);

  // Sync tempSortRules with current global sortRules when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSortRules(sortRules);
      setIsNameSortEnabled(sortRules.some(r => r.field === 'name'));
      setIsEquipmentSortEnabled(sortRules.some(r => r.field === 'equipment'));
      setIsMusclesSortEnabled(sortRules.some(r => r.field === 'targetMuscles'));
    }
  }, [isOpen, sortRules]);

  // Handle click outside and escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
  }, [isOpen]);

  const getSortRuleForField = (field: 'name' | 'equipment' | 'targetMuscles'): SortRule | undefined => {
    return tempSortRules.find(rule => rule.field === field);
  };

  const toggleSortSection = (field: 'name' | 'equipment' | 'targetMuscles', isChecked: boolean) => {
    if (field === 'name') {
      setIsNameSortEnabled(isChecked);
    } else if (field === 'equipment') {
      setIsEquipmentSortEnabled(isChecked);
    } else {
      setIsMusclesSortEnabled(isChecked);
    }

    setTempSortRules(prevRules => {
      if (isChecked) {
        // Add rule if enabled and not already present
        if (!prevRules.some(r => r.field === field)) {
          const newRule: SortRule = { id: Date.now().toString(), field, direction: 'asc' };
          return [...prevRules, newRule];
        }
      } else {
        // Remove rule if disabled
        return prevRules.filter(r => r.field !== field);
      }
      return prevRules;
    });
  };

  const toggleDirection = (field: 'name' | 'equipment' | 'targetMuscles') => {
    setTempSortRules(prevRules => {
      return prevRules.map(rule =>
        rule.field === field ? { ...rule, direction: rule.direction === 'asc' ? 'desc' : 'asc' } : rule
      );
    });
  };

  const handleApplySort = () => {
    // Filter out rules that are not enabled
    const appliedSortRules = tempSortRules.filter(rule => {
      if (rule.field === 'name') return isNameSortEnabled;
      if (rule.field === 'equipment') return isEquipmentSortEnabled;
      if (rule.field === 'targetMuscles') return isMusclesSortEnabled;
      return false;
    });
    // Ensure 'name' is always the primary sort if enabled, then others, for consistent behavior
    const sortedAppliedRules = appliedSortRules.sort((a, b) => {
        if (a.field === 'name' && b.field !== 'name') return -1;
        if (a.field !== 'name' && b.field === 'name') return 1;
        return 0; // Maintain original order for other fields
    });

    onSortRulesChange(sortedAppliedRules);
    setIsOpen(false);
  };

  const handleClearAllSortRules = () => {
    onSortRulesChange([]);
    setTempSortRules([]);
    setIsNameSortEnabled(false);
    setIsEquipmentSortEnabled(false);
    setIsMusclesSortEnabled(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg border transition-colors ${
          sortRules.length > 0
            ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <ArrowUpDown className="h-4 w-4" />
        <span>مرتب‌سازی</span>
        {sortRules.length > 0 && (
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            {sortRules.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">مرتب‌سازی تمرینات</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Name Sort Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between w-full">
                  {/* Checkbox and Title on the right */}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={isNameSortEnabled}
                      onChange={(e) => toggleSortSection('name', e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">نام تمرین</span>
                  </div>

                  {/* Icons on the left */}
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <button
                      onClick={() => toggleDirection('name')}
                      className={`p-1 rounded-full ${getSortRuleForField('name')?.direction === 'asc' ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <MoveUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleDirection('name')}
                      className={`p-1 rounded-full ${getSortRuleForField('name')?.direction === 'desc' ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <MoveDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Equipment Sort Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between w-full">
                  {/* Checkbox and Title on the right */}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={isEquipmentSortEnabled}
                      onChange={(e) => toggleSortSection('equipment', e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">وسایل</span>
                  </div>

                  {/* Icons on the left */}
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <button
                      onClick={() => toggleDirection('equipment')}
                      className={`p-1 rounded-full ${getSortRuleForField('equipment')?.direction === 'asc' ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <MoveUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleDirection('equipment')}
                      className={`p-1 rounded-full ${getSortRuleForField('equipment')?.direction === 'desc' ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <MoveDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Target Muscles Sort Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between w-full">
                  {/* Checkbox and Title on the right */}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={isMusclesSortEnabled}
                      onChange={(e) => toggleSortSection('targetMuscles', e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">عضلات</span>
                  </div>

                  {/* Icons on the left */}
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <button
                      onClick={() => toggleDirection('targetMuscles')}
                      className={`p-1 rounded-full ${getSortRuleForField('targetMuscles')?.direction === 'asc' ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <MoveUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleDirection('targetMuscles')}
                      className={`p-1 rounded-full ${getSortRuleForField('targetMuscles')?.direction === 'desc' ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      <MoveDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 space-x-reverse mt-6">
              <button
                onClick={handleApplySort}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                اعمال مرتب‌سازی
              </button>
              <button
                onClick={handleClearAllSortRules}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                پاک کردن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}