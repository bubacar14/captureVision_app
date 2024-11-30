// Configuration for different environments
const configs = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
  },
  production: {
    API_BASE_URL: 'https://capturevision-app.onrender.com',
  },
};

// Determine current environment
const environment = import.meta.env.MODE || 'development';

// Export configuration based on environment
export const API_BASE_URL = configs[environment as keyof typeof configs].API_BASE_URL;

// Export other configuration constants
export const TOKEN_KEY = 'token';
export const AUTH_HEADER = 'Authorization';
