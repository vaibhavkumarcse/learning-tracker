import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Request interceptor – attach JWT
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle expired/invalid tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid – clear and reload
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const getTasks     = ()           => axios.get(`${API_URL}/tasks`);
export const createTask   = (task)       => axios.post(`${API_URL}/tasks`, task);
export const updateTask   = (id, task)   => axios.put(`${API_URL}/tasks/${id}`, task);
export const deleteTask   = (id)         => axios.delete(`${API_URL}/tasks/${id}`);

// ─── Subjects ─────────────────────────────────────────────────────────────────
export const getSubjects    = ()         => axios.get(`${API_URL}/subjects`);
export const createSubject  = (subject)  => axios.post(`${API_URL}/subjects`, subject);
export const deleteSubject  = (id)       => axios.delete(`${API_URL}/subjects/${id}`);

// ─── Activities / Stats ───────────────────────────────────────────────────────
export const getStats      = ()          => axios.get(`${API_URL}/activities/stats`);
export const logActivity   = (activity)  => axios.post(`${API_URL}/activities/log`, activity);

// ─── Goals ────────────────────────────────────────────────────────────────────
export const getGoals     = ()           => axios.get(`${API_URL}/goals`);
export const createGoal   = (goal)       => axios.post(`${API_URL}/goals`, goal);
export const updateGoal   = (id, goal)   => axios.put(`${API_URL}/goals/${id}`, goal);
export const deleteGoal   = (id)         => axios.delete(`${API_URL}/goals/${id}`);

// ─── Auth / Profile ───────────────────────────────────────────────────────────
export const forgotPassword  = (email)                        => axios.post(`${API_URL}/auth/forgot-password`, { email });
export const resetPassword   = (email, otp, newPassword)      => axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
export const updateProfile   = (data)                         => axios.put(`${API_URL}/auth/profile`, data);
