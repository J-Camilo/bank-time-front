import api from '../config/axiosGlobal';
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  listarUsuarios: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/usuarios', { params }),
  toggleActivarUsuario: (id: number) => api.patch(`/admin/usuarios/${id}/toggle`),
  listarPublicaciones: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/publicaciones', { params }),
  eliminarPublicacion: (id: number) => api.delete(`/admin/publicaciones/${id}`),
  crearCategoria: (nombre: string, icono: string) =>
    api.post('/categorias', { nombre, icono }),
  actualizarCategoria: (id: number, nombre: string, icono: string) =>
    api.put(`/categorias/${id}`, { nombre, icono }),
  eliminarCategoria: (id: number) => api.delete(`/categorias/${id}`),
};
