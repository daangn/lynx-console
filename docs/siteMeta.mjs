export const SITE_URL = "https://lynx-console.pages.dev";

export function demoBundleUrl(siteUrl = SITE_URL) {
  return `${siteUrl.replace(/\/$/, "")}/main.lynx.bundle?fullscreen=true`;
}

// Lynx Explorer 가 등록한 스킴이에요.
export function lynxExplorerUrl(siteUrl = SITE_URL) {
  return `lynx://open?url=${encodeURIComponent(demoBundleUrl(siteUrl))}`;
}
