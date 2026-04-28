import api from '../config/axiosGlobal';
export const solicitudesService = {
  crear: (data: any) => api.post('/solicitudes', data),
  recibidas: () => api.get('/solicitudes/recibidas'),
  enviadas: () => api.get('/solicitudes/enviadas'),
  aceptar: (id: number) => api.post(`/solicitudes/${id}/aceptar`),
  rechazar: (id: number) => api.post(`/solicitudes/${id}/rechazar`),
};
