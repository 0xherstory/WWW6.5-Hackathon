import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

// Set VITE_BASE_PATH=/pawledger/ when preparing GitHub Pages artifacts.
// Leave unset (or set to /) for local dev.
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" },
    },
  },
  plugins: [
    // Pre-transform .js files containing JSX before Vite's import analysis
    {
      name: "treat-js-as-jsx",
      enforce: "pre",
      async transform(code, id) {
        if (!id.includes("/node_modules/") && id.endsWith(".js") && code.includes("<")) {
          return transformWithEsbuild(code, id, { loader: "jsx" });
        }
      },
    },
    react(),
  ],
});
