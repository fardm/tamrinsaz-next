import { SessionExercise, SessionItem, SingleSessionItem, SupersetSessionItem, UserData, WorkoutSession } from '../types';

const STORAGE_KEY = 'tamrinsaz-user-data';

const isSessionExercise = (value: unknown): value is SessionExercise => {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as SessionExercise).exerciseId === 'string' &&
    typeof (value as SessionExercise).completed === 'boolean'
  );
};

const normalizeItem = (item: any): SessionItem | null => {
  if (!item || typeof item !== 'object') return null;

  if (item.type === 'single' && isSessionExercise(item.exercise)) {
    const single: SingleSessionItem = {
      type: 'single',
      exercise: { ...item.exercise, notes: item.exercise.notes || '' }
    };
    return single;
  }

  if (item.type === 'superset' && Array.isArray(item.exercises) && item.exercises.length === 2) {
    const [first, second] = item.exercises;
    if (isSessionExercise(first) && isSessionExercise(second)) {
      const superset: SupersetSessionItem = {
        type: 'superset',
        exercises: [
          { ...first, notes: first.notes || '' },
          { ...second, notes: second.notes || '' }
        ]
      };
      return superset;
    }
  }

  return null;
};

export const normalizeSession = (session: any): WorkoutSession => {
  const normalizedItems: SessionItem[] = [];

  if (Array.isArray(session.items)) {
    session.items.forEach((item: any) => {
      const normalized = normalizeItem(item);
      if (normalized) normalizedItems.push(normalized);
    });
  } else if (Array.isArray(session.exercises)) {
    // مهاجرت از ساختار قدیمی به ساختار جدید
    session.exercises.forEach((ex: SessionExercise) => {
      if (isSessionExercise(ex)) {
        normalizedItems.push({
          type: 'single',
          exercise: { ...ex, notes: ex.notes || '' }
        });
      }
    });
  }

  return {
    id: session.id?.toString() || Date.now().toString(),
    name: session.name || 'جلسه جدید',
    createdAt: new Date(session.createdAt || Date.now()),
    items: normalizedItems
  };
};

export const getUserData = (): UserData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        parsed.sessions = parsed.sessions.map((session: WorkoutSession) => normalizeSession(session));
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
  return { sessions: [] };
};

export const saveUserData = (data: UserData): void => {
  try {
    const normalized: UserData = {
      sessions: data.sessions.map(normalizeSession)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const exportUserData = (): void => {
  const data = getUserData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tamrinsaz-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importUserData = (file: File): Promise<UserData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.sessions || !Array.isArray(data.sessions)) {
          reject(new Error('Invalid data format'));
          return;
        }
        data.sessions = data.sessions.map((session: WorkoutSession) => normalizeSession(session));
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const clearUserData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};