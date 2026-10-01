// services/produtosService.js
import api from './api';

export const produtosService = {
  async getAll(params) {
    try {
      const response = await api.get('/produtos', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/produtos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/produtos', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/produtos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/produtos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  },

  async buscarPorCodigo(codigo) {
    try {
      const response = await api.get(`/produtos/buscar/${codigo}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto por código:', error);
      throw error;
    }
  },

  async atualizarEstoque(id, quantidade) {
    try {
      const response = await api.put(`/produtos/${id}/estoque`, { quantidade });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  }
};