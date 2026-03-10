import { vanillaExtractPlugin } from "@vanilla-extract/rollup-plugin";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.tsx",
    setup: "src/setup/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  inlineOnly: false,
  outDir: "dist",
  plugins: [vanillaExtractPlugin({})],
  banner: {
    js: 'import "./index.css";',
  },
});
