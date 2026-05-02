import api from '../config/axiosGlobal';
export const valoracionesService = {
  crear: (intercambio_id: number, calificacion: number, comentario?: string) =>
    api.post('/valoraciones', { intercambio_id, calificacion, comentario }),
  listarPorUsuario: (usuarioId: number) =>
    api.get(`/valoraciones/usuario/${usuarioId}`),
};
