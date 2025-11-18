import api from './api';

export const projectService = {
  // Get all projects
  getAll: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch projects' };
    }
  },

  // Get single project
  getById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch project' };
    }
  },

  // Create project
  create: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create project' };
    }
  },

  // Update project
  update: async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update project' };
    }
  },

  // Delete project
  delete: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete project' };
    }
  },

  // Get started projects
  getStarted: async () => {
    try {
      const response = await api.get('/projects/status/started');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch started projects' };
    }
  },

  // Get not started projects
  getNotStarted: async () => {
    try {
      const response = await api.get('/projects/status/not-started');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch not started projects' };
    }
  },
};



