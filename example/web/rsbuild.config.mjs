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
    // 문서 사이트에선 이 셸이 `/demo/` 하위에 놓여요. 단독 실행은 루트 기준이라 기본값은 '/' 예요.
    assetPrefix: process.env.WEB_SHELL_ASSET_PREFIX ?? '/',
  },
  server: {
    publicDir: { name: join(__dirname, '../dist'), copyOnBuild: false },
  },
});
