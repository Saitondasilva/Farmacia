import api from './api';

export const historicoMovimentacoesService = {
  async getAll() {
    const response = await api.get('/historico-movimentacoes');
    return response.data;
  },

  async getByFuncionario(funcionarioId) {
    const response = await api.get(`/historico-movimentacoes/funcionario/${funcionarioId}`);
    return response.data;
  },

  async getByEquipamento(equipamentoId) {
    const response = await api.get(`/historico-movimentacoes/equipamento/${equipamentoId}`);
    return response.data;
  },

  async getRecentes() {
    const response = await api.get('/historico-movimentacoes/recentes');
    return response.data;
  },

  async create(movimentacaoData) {
    const response = await api.post('/historico-movimentacoes', movimentacaoData);
    return response.data;
  }
};