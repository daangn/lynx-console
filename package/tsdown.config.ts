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
  banner: {
    js: 'import "./index.css";',
  },
});
