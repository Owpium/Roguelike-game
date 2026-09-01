import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Accessible depuis le téléphone sur le même réseau : le gate M2 se juge au pouce,
  // pas à la souris.
  server: { host: true, port: 5173 },
});
