import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    // ✅ 1. Disable Browser Caching During Development
    headers: {
      "Cache-Control": "no-store", // Ensures every file is reloaded fresh
    },
  },
  // ✅ 2. Disable Vite Dependency Pre-Bundling Cache
  optimizeDeps: {
    force: true, // Forces Vite to rebuild dependencies every time
  },
  // ✅ 3. Disable Vite Build Cache (for production builds)
  build: {
    assetsInlineLimit: 0, // Prevents aggressive asset inlining
    sourcemap: false, // Include sourcemaps for debugging
    minify: true, // Enable minification for production builds
  },
});
