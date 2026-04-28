// src/config/axiosGlobal.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api/v1';

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
api.interceptors.response.use(res => res, async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && !original._retry && !refreshing) {
    original._retry = true; refreshing = true;
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch { localStorage.clear(); window.location.href = '/login'; }
    finally { refreshing = false; }
  }
  return Promise.reject(error);
});

export default api;
