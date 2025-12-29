import api from './api';

export const departamentosService = {
  async getAll() {
    const response = await api.get('/departamentos');
    return response.data;
  },

  async getWithStats() {
    const response = await api.get('/departamentos/stats');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/departamentos/${id}`);
    return response.data;
  },

  async create(departamento) {
    const response = await api.post('/departamentos', departamento);
    return response.data;
  },

  async update(id, departamento) {
    const response = await api.put(`/departamentos/${id}`, departamento);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/departamentos/${id}`);
    return response.data;
  }
};