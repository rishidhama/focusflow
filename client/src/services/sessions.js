import api from './api';

export const getSessions = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.subjectId) params.append('subjectId', filters.subjectId);
  if (filters.type) params.append('type', filters.type);
  
  const response = await api.get(`/sessions?${params.toString()}`);
  return response.data;
};

export const createSession = async (sessionData) => {
  const response = await api.post('/sessions', sessionData);
  return response.data;
};

export const updateSession = async (id, sessionData) => {
  const response = await api.put(`/sessions/${id}`, sessionData);
  return response.data;
};

export const getSessionStats = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  const response = await api.get(`/sessions/stats?${params.toString()}`);
  return response.data;
};

