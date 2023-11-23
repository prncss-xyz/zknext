import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}", "!src/tests"],
    coverage: {
      reporter: ["text", "json"],
    },
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
