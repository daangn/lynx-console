import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { defineConfig } from '@lynx-js/rspeedy';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginEntryPageConfig } from './plugins/pluginEntryPageConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname, '../package');

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  environments: {
    web: {
      source: {
        define: {
          fetch: 'globalThis.fetch',
        },
      },
      output: {
        assetPrefix: '/',
      },
    },
    lynx: {
      source: {
        // 스트리밍 예제는 로컬 SSE 서버가 있어야 해서 Lynx dev 빌드에만 넣어요
        entry: isDev ? { streaming: './src/streaming/index.tsx' } : {},
      },
    },
  },
  source: {
    entry: {
      main: './src/index.tsx',
    },
    define: {
      console: 'globalThis.console',
      fetch: 'lynx.fetch',
      __SSE_SERVER_URL__: JSON.stringify(
        `http://${getLocalIP()}:${Number(process.env.SSE_PORT) || 3100}`,
      ),
    },
    include: [
      { and: [packageDir, { not: /[\\/]node_modules[\\/]/ }] },
      /[\\/]node_modules[\\/]devalue[\\/]/,
    ],
  },
  output: {
    assetPrefix: process.env.ASSET_PREFIX ?? `http://${getLocalIP()}:<port>/`,
  },
  server: {
    // 다른 프로젝트가 3000 을 쓰고 있으면 PORT=3010 yarn dev:example 처럼 바꿔 띄워요
    port: Number(process.env.PORT) || 3000,
  },

  tools: {
    rspack(config) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'lynx-console': path.resolve(__dirname, '../package/src/index.tsx'),
      };

      return config;
    },
  },

  plugins: [
    pluginQRCode({
      schema(url) {
        return {
          LynxExplorer: `${url}?fullscreen=true`,
          LynxConsoleDemo: `https://lynx-console.pages.dev/main.lynx.bundle?fullscreen=true`,
        };
      },
    }),
    pluginReactLynx({}),
    // 이 설정이 켜진 페이지는 모든 fetch 가 네이티브 스트리밍 경로로 가요.
    // 다른 페이지가 영향을 받지 않게 streaming 엔트리에만 넣어요
    pluginEntryPageConfig({
      streaming: { enableFetchAPIStandardStreaming: true },
    }),
    pluginTypeCheck(),
  ],
});
