// services/clientesService.js
import api from './api';

export const clientesService = {
  async getAll(params) {
    try {
      const response = await api.get('/clientes', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/clientes', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/clientes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  },

  async buscarPorNif(nif) {
    try {
      const response = await api.get(`/clientes/nif/${nif}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cliente por NIF:', error);
      throw error;
    }
  }
};