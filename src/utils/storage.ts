import { UserData, WorkoutSession } from '../types';

const STORAGE_KEY = 'tamrinsaz-user-data';

export const getUserData = (): UserData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects
      parsed.sessions = parsed.sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt)
      }));
      return parsed;
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
  return { sessions: [] };
};

export const saveUserData = (data: UserData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
        // Validate and convert dates
        if (data.sessions && Array.isArray(data.sessions)) {
          data.sessions = data.sessions.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt || Date.now())
          }));
          resolve(data);
        } else {
          reject(new Error('Invalid data format'));
        }
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