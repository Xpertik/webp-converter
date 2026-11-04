import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // jSquash loads its .wasm files relative to its own modules; pre-bundling breaks those paths.
  optimizeDeps: { exclude: ['@jsquash/webp'] },
  worker: { format: 'es' },
  server: { port: 5180 },
  preview: { port: 5180 },
});
