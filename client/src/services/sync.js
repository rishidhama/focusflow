import api from './api';
import { getLocalData, saveLocalData, clearLocalData } from '../utils/storage';

export const pushToServer = async (localData) => {
  try {
    const response = await api.post('/sync/push', localData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const pullFromServer = async (lastSyncAt) => {
  try {
    const response = await api.post('/sync/pull', { lastSyncAt });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSyncStatus = async () => {
  try {
    const response = await api.get('/sync/status');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const syncData = async () => {
  try {
    const localData = getLocalData();
    const lastSyncAt = localStorage.getItem('lastSyncAt');

    // Pull from server first
    const serverData = await pullFromServer(lastSyncAt);

    // Merge local and server data (simple merge, can be improved)
    const mergedData = {
      tasks: [...(localData.tasks || []), ...(serverData.tasks || [])],
      subjects: [...(localData.subjects || []), ...(serverData.subjects || [])],
      sessions: [...(localData.sessions || []), ...(serverData.sessions || [])],
    };

    // Save merged data locally
    saveLocalData(mergedData);

    // Push local changes to server
    await pushToServer(localData);

    // Update last sync time
    localStorage.setItem('lastSyncAt', new Date().toISOString());

    return mergedData;
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
};

