export const SITE_URL = "https://lynx-console.pages.dev";

export function demoBundleUrl(siteUrl = SITE_URL) {
  return `${siteUrl.replace(/\/$/, "")}/main.lynx.bundle?fullscreen=true`;
}

// Lynx Explorer 가 등록한 스킴이에요.
export function lynxExplorerUrl(siteUrl = SITE_URL) {
  return `lynx://open?url=${encodeURIComponent(demoBundleUrl(siteUrl))}`;
}

export const DEFAULT_LOCALE = "en";
export const LOCALES = ["en", "ko", "zh"];

// 기본 언어(en)는 라우트에서 접두사가 빠져요. `/zh/guide/demo` <-> `/guide/demo`.
export function stripLocale(routePath) {
  for (const lang of LOCALES) {
    if (lang === DEFAULT_LOCALE) continue;
    if (routePath === `/${lang}` || routePath === `/${lang}/`) return "/";
    if (routePath.startsWith(`/${lang}/`))
      return routePath.slice(`/${lang}`.length);
  }
  return routePath;
}

// 라우트 하나를 모든 언어의 경로로 펼쳐요. hreflang 과 sitemap 이 같이 써요.
export function alternatePaths(routePath) {
  const base = stripLocale(routePath);
  return Object.fromEntries(
    LOCALES.map((lang) => [
      lang,
      lang === DEFAULT_LOCALE ? base : `/${lang}${base}`,
    ]),
  );
}
