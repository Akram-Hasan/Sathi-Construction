import api from './api';

export const locationService = {
  // Get all staff locations
  getAll: async () => {
    try {
      const response = await api.get('/location');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch locations' };
    }
  },

  // Get user location
  getUserLocation: async (userId) => {
    try {
      const response = await api.get(`/location/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user location' };
    }
  },
};



