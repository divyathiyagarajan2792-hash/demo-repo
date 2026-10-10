import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, send /api to the Express server so the frontend
    // uses the same paths it will use on Vercel (same-origin /api).
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
