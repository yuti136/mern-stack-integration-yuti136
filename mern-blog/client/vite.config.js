import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // ✅ Tailwind v4.1 plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Keep Tailwind plugin here
  ],
  resolve: {
    alias: {
      "@": "/src", // Alias for cleaner imports
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Express backend
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"), // Keep /api prefix
      },
    },
  },
});
