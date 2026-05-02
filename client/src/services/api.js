/**
 * client/src/services/api.js
 *
 * Axios instance مُهيَّأ بـ:
 *  - baseURL من VITE_SERVER_URL
 *  - يُضيف token تلقائياً لكل طلب
 *  - يُوجَّه لصفحة Login عند 401
 */

import axios from 'axios';
import { authService } from './authService';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:5001',
});

// ── Request Interceptor: أضف token لكل طلب ──────────────────
api.interceptors.request.use(config => {
  const token = authService.getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: تعامل مع انتهاء الجلسة ────────────
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // انتهت الجلسة — سجّل خروج وأعِد للـ Login
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;