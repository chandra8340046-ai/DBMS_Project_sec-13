import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            // Gracefully handle backend warm-up without printing terminal stack traces
            if (res && res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'offline', message: 'Backend connecting...' }));
            }
          });
        },
      },
    },
  },
});
