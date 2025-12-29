import api from './api';

export const categoriasService = {
  async getAll() {
    const response = await api.get('/categorias');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  async create(categoria) {
    const response = await api.post('/categorias', categoria);
    return response.data;
  },

  async update(id, categoria) {
    const response = await api.put(`/categorias/${id}`, categoria);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
  }
};