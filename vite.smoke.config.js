// Internal only: builds an IIFE bundle so the app can be executed in jsdom for smoke tests.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": '"production"' },
  build: {
    outDir: "dist-smoke",
    lib: { entry: "src/main.jsx", name: "CatzoraApp", formats: ["iife"], fileName: () => "app.iife.js" },
    cssCodeSplit: false,
  },
});
