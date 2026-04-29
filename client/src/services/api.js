import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTasks = () => axios.get(`${API_URL}/tasks`);
export const createTask = (task) => axios.post(`${API_URL}/tasks`, task);
export const updateTask = (id, task) => axios.put(`${API_URL}/tasks/${id}`, task);
export const deleteTask = (id) => axios.delete(`${API_URL}/tasks/${id}`);

export const getSubjects = () => axios.get(`${API_URL}/subjects`);
export const createSubject = (subject) => axios.post(`${API_URL}/subjects`, subject);

export const getStats = () => axios.get(`${API_URL}/activities/stats`);
export const logActivity = (activity) => axios.post(`${API_URL}/activities/log`, activity);
