import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rsbuild/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  source: {
    entry: { index: join(__dirname, 'main.ts') },
  },
  html: {
    template: join(__dirname, 'index.html'),
  },
  output: {
    distPath: { root: join(__dirname, 'dist') },
  },
  server: {
    publicDir: { name: join(__dirname, '../dist'), copyOnBuild: false },
  },
});
