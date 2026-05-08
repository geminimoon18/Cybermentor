import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,       // fail if 5173 is taken (bat file clears it first)
    open: false,            // bat file handles browser opening
    proxy: {
      // All /api/* calls → Flask backend on 5000
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
