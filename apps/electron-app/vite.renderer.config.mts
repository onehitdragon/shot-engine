import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: '../react-app',
  cacheDir: resolve(import.meta.dirname, '.vite'),
  build: {
    outDir: resolve(import.meta.dirname, '.vite/renderer/main_window')
  }
});
