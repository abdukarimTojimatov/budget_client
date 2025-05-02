import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default {
  server: {
    host: "0.0.0.0", // Listen on all interfaces
    port: 3003, // Ensure it's set to port 3000
  },
};
