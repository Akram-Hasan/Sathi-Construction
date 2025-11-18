import api, { setToken, removeToken } from "./api";

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success && response.data.token) {
        setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.success && response.data.token) {
        setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to get user" };
    }
  },

  // Update location
  updateLocation: async (locationData) => {
    try {
      const response = await api.put("/auth/update-location", locationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update location" };
    }
  },

  // Logout
  logout: () => {
    removeToken();
  },
};
