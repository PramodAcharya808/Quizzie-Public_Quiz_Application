import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// const backendUrl = "https://quizcraft-gl9v.onrender.com";
const backendUrl = "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
  },
});
