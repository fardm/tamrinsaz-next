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

type RawSession = {
  id?: unknown;
  name?: unknown;
  createdAt?: unknown;
  items?: unknown;
  exercises?: unknown;
};

const normalizeItem = (item: unknown): SessionItem | null => {
  if (!item || typeof item !== 'object') return null;

  const rawItem = item as { type?: unknown; exercise?: unknown; exercises?: unknown };

  if (rawItem.type === 'single' && isSessionExercise(rawItem.exercise)) {
    const single: SingleSessionItem = {
      type: 'single',
      exercise: { ...rawItem.exercise, notes: rawItem.exercise.notes || '' }
    };
    return single;
  }

  if (rawItem.type === 'superset' && Array.isArray(rawItem.exercises) && rawItem.exercises.length === 2) {
    const [first, second] = rawItem.exercises;
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

export const normalizeSession = (session: unknown): WorkoutSession => {
  const rawSession: RawSession = (session && typeof session === 'object') ? (session as RawSession) : {};
  const normalizedItems: SessionItem[] = [];

  if (Array.isArray(rawSession.items)) {
    rawSession.items.forEach((rawItem) => {
      const normalized = normalizeItem(rawItem);
      if (normalized) normalizedItems.push(normalized);
    });
  } else if (Array.isArray(rawSession.exercises)) {
    // مهاجرت از ساختار قدیمی به ساختار جدید
    (rawSession.exercises as unknown[]).forEach((rawExercise) => {
      if (isSessionExercise(rawExercise)) {
        normalizedItems.push({
          type: 'single',
          exercise: { ...rawExercise, notes: rawExercise.notes || '' }
        });
      }
    });
  }

  const rawCreatedAt = rawSession.createdAt;
  const createdAt =
    rawCreatedAt instanceof Date || typeof rawCreatedAt === 'string' || typeof rawCreatedAt === 'number'
      ? new Date(rawCreatedAt)
      : new Date();

  return {
    id: rawSession.id?.toString() || Date.now().toString(),
    name: typeof rawSession.name === 'string' ? rawSession.name : 'جلسه جدید',
    createdAt,
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