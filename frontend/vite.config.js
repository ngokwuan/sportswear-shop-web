import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': '/src',
    },
  },
  server: {
    // Expose to all interfaces — required when running inside Docker
    host: '0.0.0.0',
    port: 5173,
    // Use polling for file watching inside Docker on Windows/macOS
    // (native FS events don't propagate through volume mounts)
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
