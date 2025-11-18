// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// For Android emulator, use: http://10.0.2.2:5000/api
// For iOS simulator, use: http://localhost:5000/api
// For physical device, use your computer's IP: http://192.168.x.x:5000/api

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    UPDATE_LOCATION: '/auth/update-location',
  },
  PROJECTS: {
    BASE: '/projects',
    STARTED: '/projects/status/started',
    NOT_STARTED: '/projects/status/not-started',
  },
  MANPOWER: {
    BASE: '/manpower',
    AVAILABLE: '/manpower/available',
  },
  PROGRESS: {
    BASE: '/progress',
    BY_PROJECT: (id) => `/progress/project/${id}`,
  },
  MATERIALS: {
    BASE: '/materials',
    AVAILABLE: '/materials/available',
    REQUIRED: '/materials/required',
  },
  FINANCE: {
    BASE: '/finance',
    SUMMARY: '/finance/summary',
    BY_PROJECT: (id) => `/finance/project/${id}`,
  },
  LOCATION: {
    BASE: '/location',
    BY_USER: (id) => `/location/user/${id}`,
  },
};



