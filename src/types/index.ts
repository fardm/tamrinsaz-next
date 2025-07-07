export interface Exercise {
  id: string;
  name: string;
  image?: string;
  targetMuscles: string[];
  equipment: string;
  type?: string; // فیلد جدید: نوع تمرین
  otherNames?: string;
  description?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  exercises: SessionExercise[];
  createdAt: Date;
}

export interface SessionExercise {
  exerciseId: string;
  completed: boolean;
  notes?: string; // فیلد اختیاری برای یادداشت‌ها
}

export interface UserData {
  sessions: WorkoutSession[];
}

export interface FilterRule {
  id: string;
  field: 'equipment' | 'targetMuscles' | 'type'; // 'type' به فیلدهای فیلتر اضافه شد
  values: string[];
}

export interface SortRule {
  id: string;
  field: 'name' | 'equipment' | 'targetMuscles';
  direction: 'asc' | 'desc';
}

