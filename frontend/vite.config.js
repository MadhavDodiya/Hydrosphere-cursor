import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Read PORT from backend/.env so dev + preview proxies match the API. */
function getBackendProxyTarget() {
  const envPath = path.resolve(__dirname, "../backend/.env");
  let port = 5000;
  try {
    let raw = fs.readFileSync(envPath, "utf8");
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    const m = raw.match(/^\s*PORT\s*=\s*(\d+)/m);
    if (m) port = parseInt(m[1], 10);
  } catch {
    /* default 5000 */
  }
  return `http://127.0.0.1:${port}`;
}

function apiProxy(target) {
  return {
    "/api": {
      target,
      changeOrigin: true,
      secure: false,
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const target = env.VITE_API_PROXY || getBackendProxyTarget();

  return {
    plugins: [react()],
    // Dev: npm run dev — browser calls /api → proxied to Express
    server: {
      proxy: apiProxy(target),
    },
    // Production build preview: npm run preview — same /api proxy to backend
    preview: {
      proxy: apiProxy(target),
    },
    test: {
      globals: true,
      environment: 'jsdom',
    },
  };
});
