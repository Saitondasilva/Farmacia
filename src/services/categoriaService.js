import api from './api';

export const categoriaService = {
    getAll: async () => {
        const response = await api.get('/categorias');
        // O backend retorna o array diretamente, não em um wrapper 'data'
        return response.data; // Isso já é o array de categorias
    },

    getById: async (id) => {
        const response = await api.get(`/categorias/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/categorias', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/categorias/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/categorias/${id}`);
        return response.data;
    }
};