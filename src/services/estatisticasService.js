import api from './api';

const handleApiError = (error) => {
  console.error('API Error:', error);
  throw new Error(error.response?.data?.message || 'Erro ao comunicar com o servidor');
};

export const estatisticasService = {
  async getDashboardStats() {
    try {
      const response = await api.get('/estatisticas/dashboard');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getEquipamentosPorDepartamento() {
    try {
      const response = await api.get('/estatisticas/equipamentos-departamento');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCustosPorCategoria() {
    try {
      const response = await api.get('/estatisticas/custos-categoria');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getEstatisticasManutencao(meses = 12) {
    try {
      const response = await api.get(`/estatisticas/manutencao?meses=${meses}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAlertasSistema() {
    try {
      const response = await api.get('/estatisticas/alertas');
      return response.data;
    } catch (error) {
      // Retorna array vazio se houver erro para não quebrar o dashboard
      console.error('Erro ao obter alertas:', error);
      return { data: [] };
    }
  },

  async getMovimentacoesDetalhadas() {
    try {
      const response = await api.get('/estatisticas/movimentacoes');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getEquipamentosManutencao() {
    try {
      const response = await api.get('/estatisticas/manutencoes');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};