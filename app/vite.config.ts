import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// The library is a fully static site. public/ (clips, thumbnails, captions,
// synced data) is served at the web root, so the same relative URLs work in
// dev and in the built site.
export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, '..', 'public'),
  base: './',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
  },
});
