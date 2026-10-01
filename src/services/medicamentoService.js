// services/medicamentoService.js
import api from './api';

export const medicamentoService = {
    getAll: async () => {
        const response = await api.get('/medicamentos');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/medicamentos/${id}`);
        return response.data;
    },

    estoqueBaixo: async () => {
        const response = await api.get('/medicamentos/estoque-baixo');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/medicamentos', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/medicamentos/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/medicamentos/${id}`);
        return response.data;
    }
};