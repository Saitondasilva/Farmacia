import api from './api';

export const fornecedorService = {
  async getAll() {
    const response = await api.get('/fornecedores');
    return response.data;
  },

  async getByFornecodorEquipamentos() {
    const response = await api.get('/fornecedores/equipamentos');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/fornecedores/${id}`);
    return response.data;
  },

  async create(fornecedor) {
    const response = await api.post('/fornecedores', fornecedor);
    return response.data;
  },

  async update(id, fornecedor) {
    const response = await api.put(`/fornecedores/${id}`, fornecedor);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/fornecedores/${id}`);
    return response.data;
  }
};