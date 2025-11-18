import api from './api';

export const progressService = {
  // Get all progress reports
  getAll: async () => {
    try {
      const response = await api.get('/progress');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch progress reports' };
    }
  },

  // Get progress for a project
  getByProject: async (projectId) => {
    try {
      const response = await api.get(`/progress/project/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch project progress' };
    }
  },

  // Create progress report
  create: async (progressData) => {
    try {
      const response = await api.post('/progress', progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create progress report' };
    }
  },

  // Update progress report
  update: async (id, progressData) => {
    try {
      const response = await api.put(`/progress/${id}`, progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update progress report' };
    }
  },
};



