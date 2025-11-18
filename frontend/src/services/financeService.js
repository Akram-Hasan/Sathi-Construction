import api from './api';

export const financeService = {
  // Get all finance records
  getAll: async () => {
    try {
      const response = await api.get('/finance');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch finance records' };
    }
  },

  // Get finance summary
  getSummary: async () => {
    try {
      const response = await api.get('/finance/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch finance summary' };
    }
  },

  // Get finance for a project
  getByProject: async (projectId) => {
    try {
      const response = await api.get(`/finance/project/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch project finance' };
    }
  },

  // Create finance record
  create: async (financeData) => {
    try {
      const response = await api.post('/finance', financeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create finance record' };
    }
  },

  // Update finance record
  update: async (id, financeData) => {
    try {
      const response = await api.put(`/finance/${id}`, financeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update finance record' };
    }
  },
};



