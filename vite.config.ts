import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('\n=== Proxy Error ===');
            console.error('Time:', new Date().toISOString());
            console.error('Error:', err);
            console.error('Request URL:', req.url);
            console.error('==================\n');
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('\n=== Proxy Request ===');
            console.log('Time:', new Date().toISOString());
            console.log('URL:', req.url);
            console.log('Method:', req.method);
            console.log('Headers:', req.headers);
            console.log('===================\n');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('\n=== Proxy Response ===');
            console.log('Time:', new Date().toISOString());
            console.log('Status:', proxyRes.statusCode);
            console.log('Headers:', proxyRes.headers);
            
            let body = '';
            proxyRes.on('data', function(chunk) {
              body += chunk;
            });
            proxyRes.on('end', function() {
              console.log('Response body:', body);
              console.log('====================\n');
            });
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
