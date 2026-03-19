import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pluginQRCode } from "@lynx-js/qrcode-rsbuild-plugin";
import { pluginReactLynx } from "@lynx-js/react-rsbuild-plugin";
import { defineConfig } from "@lynx-js/rspeedy";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.resolve(__dirname, "../package");

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName] ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
};

export default defineConfig({
  source: {
    entry: {
      main: "./src/index.tsx",
    },
    define: { console: "globalThis.console" },
    include: [
      /@lynx-js\/preact-devtools/,
      {
        and: [packageDir, { not: /[\\/]node_modules[\\/]/ }],
      },
    ],
  },
  output: {
    assetPrefix: process.env.ASSET_PREFIX ?? `http://${getLocalIP()}:<port>/`,
  },

  tools: {
    rspack(config) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "lynx-console": path.resolve(__dirname, "../package/src/index.tsx"),
      };

      return config;
    },
  },

  plugins: [
    pluginQRCode({
      schema(url) {
        return {
          LynxExplorer: `${url}?fullscreen=true`,
          LynxConsoleDemo: `https://lynx-console-demo.vercel.app/main.lynx.bundle?fullscreen=true`,
        };
      },
    }),
    pluginReactLynx({}),
    pluginTypeCheck(),
  ],
});
