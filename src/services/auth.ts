// src/services/auth.ts
import api from '../config/axiosGlobal';
export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (correo: string, contrasena: string) => api.post('/auth/login', { correo, contrasena }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
};
