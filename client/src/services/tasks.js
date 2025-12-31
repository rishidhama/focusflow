import api from './api';

export const getTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.subjectId) params.append('subjectId', filters.subjectId);
  
  const response = await api.get(`/tasks?${params.toString()}`);
  return response.data;
};

export const getTask = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export const completeTask = async (id) => {
  const response = await api.put(`/tasks/${id}/complete`);
  return response.data;
};

