import api from '../config/axiosGlobal';
export const notificacionesService = {
  listar: (soloNoLeidas = false) => api.get('/notificaciones', { params: { no_leidas: soloNoLeidas } }),
  marcarLeida: (id: number) => api.patch(`/notificaciones/${id}/leer`),
};
