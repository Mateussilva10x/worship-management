/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from 'fs'; 
import { resolve } from 'path'; 

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf8')
);

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
  define: {
    '__APP_VERSION__': JSON.stringify(packageJson.version),
  },
});