// src/services/publicaciones.ts
import api from '../config/axiosGlobal';
export const publicacionesService = {
  listar: (params?: any) => api.get('/publicaciones', { params }),
  obtener: (id: number) => api.get(`/publicaciones/${id}`),
  miasPublicaciones: (expired = false) => api.get('/publicaciones/mis', { params: { expired } }),
  crear: (data: any) => api.post('/publicaciones', data),
  actualizar: (id: number, data: any) => api.put(`/publicaciones/${id}`, data),
  eliminar: (id: number) => api.delete(`/publicaciones/${id}`),
  matches: (id: number) => api.get(`/publicaciones/${id}/matches`),
};
