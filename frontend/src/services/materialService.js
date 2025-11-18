import api from './api';

export const materialService = {
  // Get all materials
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/materials', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch materials' };
    }
  },

  // Get available materials
  getAvailable: async () => {
    try {
      const response = await api.get('/materials/available');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch available materials' };
    }
  },

  // Get required materials
  getRequired: async () => {
    try {
      const response = await api.get('/materials/required');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch required materials' };
    }
  },

  // Create material
  create: async (materialData) => {
    try {
      const response = await api.post('/materials', materialData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create material' };
    }
  },

  // Update material
  update: async (id, materialData) => {
    try {
      const response = await api.put(`/materials/${id}`, materialData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update material' };
    }
  },

  // Delete material
  delete: async (id) => {
    try {
      const response = await api.delete(`/materials/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete material' };
    }
  },
};



