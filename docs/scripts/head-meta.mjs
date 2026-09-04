import fs from "node:fs";
import {
  alternatePaths,
  DEFAULT_LOCALE,
  LOCALES,
  SITE_URL,
  stripLocale,
} from "../siteMeta.mjs";

const SITE_NAME = "lynx-console";
const OG_IMAGE = `${SITE_URL}/og.png`;

const DEFAULTS = {
  en: {
    title: "lynx-console",
    description:
      "An in-app developer console for Lynx apps. Read console logs, fetch requests, and performance metrics on a real device, with no debugger attached.",
    ogLocale: "en_US",
  },
  ko: {
    title: "lynx-console",
    description:
      "Lynx 앱에 넣는 인앱 개발자 콘솔이에요. 디버거 없이도 실기기에서 콘솔 로그, fetch 요청, 성능 지표를 봐요.",
    ogLocale: "ko_KR",
  },
  zh: {
    title: "lynx-console",
    description:
      "Lynx 应用的应用内开发者控制台。不用连调试器，就能在真机上查看控制台日志、fetch 请求和性能指标。",
    ogLocale: "zh_CN",
  },
};

function readFrontmatter(absolutePath) {
  try {
    const raw = fs.readFileSync(absolutePath, "utf8");
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const block = match[1];
    const pick = (key) => {
      const line = block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
      return line ? line[1].trim().replace(/^["']|["']$/g, "") : undefined;
    };
    return {
      title: pick("title"),
      description: pick("description"),
      titleSuffix: pick("titleSuffix"),
    };
  } catch {
    return {};
  }
}

function toPath(routePath) {
  const clean = routePath.replace(/index$/, "").replace(/\/+$/, "/");
  return clean.startsWith("/") ? clean : `/${clean}`;
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

export function buildHead(route) {
  const lang = LOCALES.includes(route.lang) ? route.lang : DEFAULT_LOCALE;
  const fm = readFrontmatter(route.absolutePath);
  const fallback = DEFAULTS[lang];
  const routePath = toPath(route.routePath);
  const isHome = stripLocale(routePath) === "/";
  const title = isHome
    ? [SITE_NAME, fm.titleSuffix].filter(Boolean).join(" - ")
    : `${fm.title ?? fallback.title} - ${SITE_NAME}`;
  const description = fm.description ?? fallback.description;

  const canonical = `${SITE_URL}${routePath}`;
  const alternates = alternatePaths(routePath);

  const tags = [
    `<link rel="canonical" href="${escapeAttr(canonical)}">`,
    ...LOCALES.map(
      (l) =>
        `<link rel="alternate" hreflang="${l}" href="${escapeAttr(`${SITE_URL}${alternates[l]}`)}">`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${escapeAttr(`${SITE_URL}${alternates[DEFAULT_LOCALE]}`)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:locale" content="${fallback.ogLocale}">`,
    `<meta property="og:url" content="${escapeAttr(canonical)}">`,
    `<meta property="og:title" content="${escapeAttr(title)}">`,
    `<meta property="og:description" content="${escapeAttr(description)}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
  ];

  if (isHome) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: SITE_NAME,
      description,
      url: `${SITE_URL}${routePath}`,
      codeRepository: "https://github.com/daangn/lynx-console",
      programmingLanguage: "TypeScript",
      runtimePlatform: "Lynx",
    };
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
    );
  }

  return tags.join("");
}
