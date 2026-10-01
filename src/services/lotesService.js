// services/lotesService.js
import api from './api';

export const lotesService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/lotes', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lotes:', error);
      throw error;
    }
  },

  // Buscar lotes por medicamento usando o endpoint GET /lotes com filtro
  async getByMedicamento(medicamentoId) {
    try {
      // Usar o endpoint existente /lotes com filtro
      const response = await api.get('/lotes', { 
        params: { medicamento_id: medicamentoId }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lotes do medicamento:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/lotes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lote:', error);
      throw error;
    }
  },

  async getVencidos() {
    try {
      const response = await api.get('/lotes/vencidos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lotes vencidos:', error);
      throw error;
    }
  },

  async getProximosVencimento() {
    try {
      const response = await api.get('/lotes/proximos-vencimento');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lotes próximos ao vencimento:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/lotes', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar lote:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/lotes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar lote:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/lotes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar lote:', error);
      throw error;
    }
  }
};