import path from "node:path";
import type { NextConfig } from "next";

/**
 * Builder (simula o "hub"). Roda em paralelo ao renderer:
 *   npm run dev          → renderer  :3000
 *   npm run dev:builder  → builder   :3001
 * O root do Turbopack é a raiz do repo para poder importar ../src (componentes e schema
 * compartilhados) usando o mesmo node_modules (uma única instância de React).
 */
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
