import api from './api';

export const utilizadoresService = {
  async getAll() {
    const response = await api.get('/usuarios');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  async create(utilizador) {
    const response = await api.post('/usuarios', utilizador);
    return response.data;
  },

  async update(id, utilizador) {
    const response = await api.put(`/usuarios/${id}`, utilizador);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};
