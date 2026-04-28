import api from '../config/axiosGlobal';
export const usuariosService = {
  perfil: () => api.get('/usuarios/me'),
  creditos: () => api.get('/usuarios/me/creditos'),
  historial: (params?: any) => api.get('/usuarios/me/historial', { params }),
  actualizar: (data: any) => api.put('/usuarios/me', data),
};
