import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
 server: {
    proxy: {
      '/api': {
        target:       'https://isam-tech.com/backend/public',
        changeOrigin: true,
        secure:       false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});


