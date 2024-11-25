import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Écoute sur toutes les adresses IP disponibles
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  },
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  }
});
