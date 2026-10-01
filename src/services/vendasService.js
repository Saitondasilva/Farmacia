// services/vendasService.js
import api from './api';

export const vendasService = {
  async getAll(params) {
    try {
      const response = await api.get('/vendas', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/vendas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/vendas', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/vendas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/vendas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar venda:', error);
      throw error;
    }
  },

  async getRelatorio(params) {
    try {
      const response = await api.get('/vendas/relatorio', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      throw error;
    }
  },

  async cancelar(id) {
    try {
      const response = await api.put(`/vendas/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      throw error;
    }
  }
};