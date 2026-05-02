// src/services/intercambios.ts
import api from '../config/axiosGlobal';
export const intercambiosService = {
  listar: (estado?: string) => api.get('/intercambios', { params: { estado } }),
  obtener: (id: number) => api.get(`/intercambios/${id}`),
  confirmar: (id: number) => api.post(`/intercambios/${id}/confirmar`),
  cancelar: (id: number) => api.post(`/intercambios/${id}/cancelar`),
};
