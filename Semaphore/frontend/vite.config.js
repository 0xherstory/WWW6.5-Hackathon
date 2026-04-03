import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { handlePinataJsonRequest } from "./server/pinata.js";

export default defineConfig({
  define: {
    global: "globalThis",
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      configureServer(server) {
        server.middlewares.use("/api/pinata-json", async (request, response, next) => {
          if (request.method !== "POST") {
            next();
            return;
          }

          try {
            const chunks = [];

            for await (const chunk of request) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }

            const rawBody = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
            const payload = await handlePinataJsonRequest(rawBody);

            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(payload));
          } catch (error) {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : "Pinata 上传失败。",
              }),
            );
          }
        });
      },
      name: "seamphore-pinata-dev-api",
    },
  ],
  resolve: {
    alias: {
      buffer: "buffer/",
      process: "process/browser",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});
