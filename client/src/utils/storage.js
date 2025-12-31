// Local storage utilities using localStorage
// For production, consider using IndexedDB for better performance

const STORAGE_KEYS = {
  TASKS: 'focusflow_tasks',
  SUBJECTS: 'focusflow_subjects',
  SESSIONS: 'focusflow_sessions',
  SETTINGS: 'focusflow_settings',
};

export const getLocalData = () => {
  try {
    return {
      tasks: JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]'),
      subjects: JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || '[]'),
      sessions: JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]'),
      settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}'),
    };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { tasks: [], subjects: [], sessions: [], settings: {} };
  }
};

export const saveLocalData = (data) => {
  try {
    if (data.tasks) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
    }
    if (data.subjects) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(data.subjects));
    }
    if (data.sessions) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const clearLocalData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const getSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  } catch (error) {
    console.error('Error reading settings:', error);
    return {};
  }
};

