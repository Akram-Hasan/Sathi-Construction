import api from './api';

export const manpowerService = {
  // Get all manpower
  getAll: async () => {
    try {
      const response = await api.get('/manpower');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch manpower' };
    }
  },

  // Get available manpower
  getAvailable: async () => {
    try {
      const response = await api.get('/manpower/available');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch available manpower' };
    }
  },

  // Create manpower
  create: async (manpowerData) => {
    try {
      const response = await api.post('/manpower', manpowerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create manpower' };
    }
  },

  // Update manpower
  update: async (id, manpowerData) => {
    try {
      const response = await api.put(`/manpower/${id}`, manpowerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update manpower' };
    }
  },

  // Delete manpower
  delete: async (id) => {
    try {
      const response = await api.delete(`/manpower/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete manpower' };
    }
  },
};



