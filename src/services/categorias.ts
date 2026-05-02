// src/services/categorias.ts
import api from '../config/axiosGlobal';
export const categoriasService = { listar: () => api.get('/categorias') };
