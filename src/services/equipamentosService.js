import api from './api';

export const equipamentosService = {
  // Obter todos os equipamentos
  async getAll() {
    const response = await api.get('/equipamentos');
    return response.data;
  },

  // Obter equipamento por ID
  async getById(id) {
    const response = await api.get(`/equipamentos/${id}`);
    return response.data;
  },

  // Obter equipamentos por estado
  async getByEstado(estado) {
    const response = await api.get(`/equipamentos/estado/${estado}`);
    return response.data;
  },

  // Criar equipamento
  async create(equipamento) {
    const response = await api.post('/equipamentos', equipamento);
    return response.data;
  },

  // NOVO: Criar marca independente
  async createMarca(marcaData) {
    const response = await api.post('/equipamentos/marcas', marcaData);
    return response.data;
  },

  // Obter todas as marcas
  async getAllMarcas() {
    const response = await api.get('/equipamentos/marcas/all');
    return response.data;
  },

  // Atualizar equipamento
  async update(id, equipamento) {
    const response = await api.put(`/equipamentos/${id}`, equipamento);
    return response.data;
  },

  // Atualizar estado do equipamento
  async updateEstado(id, estado) {
    const response = await api.patch(`/equipamentos/${id}/estado`, { estado });
    return response.data;
  },

  // Eliminar equipamento
  async delete(id) {
    const response = await api.delete(`/equipamentos/${id}`);
    return response.data;
  }
};