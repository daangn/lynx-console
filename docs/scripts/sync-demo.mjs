// example 워크스페이스의 빌드 산출물을 문서 사이트의 src/public/ 으로 옮겨요.
//
// 결과적으로 배포된 사이트는 이런 모양이 돼요.
//   /                      docs (rspress)
//   /main.lynx.bundle      Lynx Explorer 로 열 수 있는 예제 번들
//   /main.web.bundle       Lynx Web Platform 용 예제 번들
//   /async/*.bundle        lynx-console lazy chunk
//   /demo/                 <lynx-view> 호스트 셸 (문서에 iframe 으로 임베드)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import { SITE_URL as DEFAULT_SITE_URL, demoBundleUrl } from "../siteMeta.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(siteDir, "..");
const assetsDir = path.join(siteDir, "assets");
const exampleDist = path.join(repoRoot, "example", "dist");
const webShellDist = path.join(repoRoot, "example", "web", "dist");
const publicDir = path.join(siteDir, "src", "public");

const SITE_URL = (process.env.SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");

function log(message) {
  console.log(`[sync-demo] ${message}`);
}

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyInto(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyInto(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

function buildWebShell() {
  log("building the <lynx-view> host shell for /demo/");
  const result = spawnSync(
    "yarn",
    ["workspace", "lynx-console-test", "build:web"],
    {
      cwd: repoRoot,
      stdio: "inherit",
      env: { ...process.env, WEB_SHELL_ASSET_PREFIX: "/demo/" },
      shell: process.platform === "win32",
    },
  );
  if (result.status !== 0) {
    throw new Error("failed to build example/web");
  }
}

async function writeExplorerQRCode() {
  const target = demoBundleUrl(SITE_URL);
  const svg = await QRCode.toString(target, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
  });
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "lynx-explorer-qr.svg"), svg);
  log(`wrote QR code for ${target}`);
}

async function main() {
  // public 은 통째로 gitignore 라, 레포에 두는 정적 파일은 assets/ 에 둬요.
  copyInto(assetsDir, publicDir);
  await writeExplorerQRCode();

  if (!fs.existsSync(path.join(exampleDist, "main.lynx.bundle"))) {
    log(
      "example/dist 가 없어 데모 복사를 건너뛰어요. `yarn build && yarn build:example` 를 먼저 실행해요.",
    );
    return;
  }

  buildWebShell();

  rmrf(path.join(publicDir, "async"));
  rmrf(path.join(publicDir, "demo"));
  for (const name of fs.readdirSync(publicDir)) {
    if (name.endsWith(".bundle")) rmrf(path.join(publicDir, name));
  }

  copyInto(exampleDist, publicDir);
  copyInto(webShellDist, path.join(publicDir, "demo"));
  log(
    "copied example bundles to src/public/ and the host shell to src/public/demo/",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
