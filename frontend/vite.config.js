import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // When the frontend makes calls to /api, forward these to your backend
      "/api": {
        target: "http://localhost:5000", // backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
