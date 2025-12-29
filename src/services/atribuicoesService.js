import api from './api';

export const atribuicoesService = {
  async getAtivas() {
    try {
      const response = await api.get('/atribuicoes/ativas');
      // Retorne o array de dados corretamente
      return response.data?.data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar ativas:', error);
      return [];
    }
  },

  async getDevolvidas() {
    try {
      const response = await api.get('/atribuicoes/devolvidas');
      // Retorne o array de dados corretamente
      return response.data?.data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar devolvidas:', error);
      return [];
    }
  },

  async getAll() {
    try {
      const response = await api.get('/atribuicoes');
      return response.data?.data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar todas:', error);
      return [];
    }
  },

  async getById(id) {
    const response = await api.get(`/atribuicoes/${id}`);
    return response.data;
  },

  async getByEquipamento(equipamentoId) {
    const response = await api.get(`/atribuicoes/equipamento/${equipamentoId}`);
    return response.data;
  },

  async getByFuncionario(funcionarioId) {
    const response = await api.get(`/atribuicoes/funcionario/${funcionarioId}`);
    return response.data;
  },

  async create(atribuicao) {
    const response = await api.post('/atribuicoes', atribuicao);
    return response.data;
  },

  async update(id, atribuicao) {
    const response = await api.put(`/atribuicoes/${id}`, atribuicao);
    return response.data;
  },

  async devolver(id) {
    const response = await api.patch(`/atribuicoes/${id}/devolver`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/atribuicoes/${id}`);
    return response.data;
  }
};