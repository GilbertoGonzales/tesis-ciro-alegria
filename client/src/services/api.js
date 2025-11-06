import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username, password) => 
  api.post('/auth/login', { username, password });

// Teachers
export const getTeachers = (params) => 
  api.get('/teachers', { params });

export const getTeacher = (id) => 
  api.get(`/teachers/${id}`);

export const createTeacher = (data) => 
  api.post('/teachers', data);

export const updateTeacher = (id, data) => 
  api.put(`/teachers/${id}`, data);

export const deleteTeacher = (id) => 
  api.delete(`/teachers/${id}`);

// Attendance
export const getAttendance = (params) => 
  api.get('/attendance', { params });

export const getAttendanceById = (id) => 
  api.get(`/attendance/${id}`);

export const createAttendance = (data) => 
  api.post('/attendance', data);

export const updateAttendance = (id, data) => 
  api.put(`/attendance/${id}`, data);

export const deleteAttendance = (id) => 
  api.delete(`/attendance/${id}`);

export const getAttendanceStats = (params) => 
  api.get('/attendance/stats/summary', { params });

export default api;
