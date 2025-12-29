import api from './api';

export const funcionariosService = {
  async getAll() {
    const response = await api.get('/funcionarios?ativos=false');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/funcionarios/${id}`);
    return response.data;
  },

  async getByDepartamento(departamento_id) {
    const response = await api.get(`/funcionarios/departamento/${departamento_id}`);
    return response.data;
  },

  async create(funcionario) {
    const response = await api.post('/funcionarios', funcionario);
    return response.data;
  },

  async update(id, funcionario) {
    const response = await api.put(`/funcionarios/${id}`, funcionario);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/funcionarios/${id}`);
    return response.data;
  }
};