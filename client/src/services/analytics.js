import api from './api';

export const getTimeBySubject = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  const response = await api.get(`/analytics/time-by-subject?${params.toString()}`);
  return response.data;
};

export const getTimeByDate = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.groupBy) params.append('groupBy', filters.groupBy);
  
  const response = await api.get(`/analytics/time-by-date?${params.toString()}`);
  return response.data;
};

export const getProductivityTrends = async (days = 30) => {
  const response = await api.get(`/analytics/productivity-trends?days=${days}`);
  return response.data;
};

export const getTaskCompletion = async () => {
  const response = await api.get('/analytics/task-completion');
  return response.data;
};

