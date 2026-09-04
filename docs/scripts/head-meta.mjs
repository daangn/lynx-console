import fs from "node:fs";
import { SITE_URL } from "../siteMeta.mjs";

const SITE_NAME = "lynx-console";
const OG_IMAGE = `${SITE_URL}/og.png`;

const DEFAULTS = {
  en: {
    title: "lynx-console",
    description:
      "An in-app developer console for Lynx apps. Read console logs, fetch requests, and performance metrics on a real device, with no debugger attached.",
  },
  ko: {
    title: "lynx-console",
    description:
      "Lynx 앱에 넣는 인앱 개발자 콘솔이에요. 디버거 없이도 실기기에서 콘솔 로그, fetch 요청, 성능 지표를 봐요.",
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

// `/ko/guide/demo` <-> `/guide/demo`. 기본 언어(en)는 접두사가 없어요.
function toPath(routePath) {
  const clean = routePath.replace(/index$/, "").replace(/\/+$/, "/");
  return clean.startsWith("/") ? clean : `/${clean}`;
}

function alternates(routePath) {
  const p = toPath(routePath);
  const isKo = p === "/ko" || p.startsWith("/ko/");
  const en = isKo ? p.replace(/^\/ko/, "") || "/" : p;
  const ko = isKo ? p : `/ko${p === "/" ? "/" : p}`;
  return { en, ko };
}

function escape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

export function buildHead(route) {
  const lang = route.lang === "ko" ? "ko" : "en";
  const fm = readFrontmatter(route.absolutePath);
  const fallback = DEFAULTS[lang];
  const isHome =
    toPath(route.routePath) === "/" || toPath(route.routePath) === "/ko/";
  const title = isHome
    ? [SITE_NAME, fm.titleSuffix].filter(Boolean).join(" - ")
    : `${fm.title ?? fallback.title} - ${SITE_NAME}`;
  const description = fm.description ?? fallback.description;

  const canonical = `${SITE_URL}${toPath(route.routePath)}`;
  const { en, ko } = alternates(route.routePath);

  const tags = [
    `<link rel="canonical" href="${escape(canonical)}">`,
    `<link rel="alternate" hreflang="en" href="${escape(`${SITE_URL}${en}`)}">`,
    `<link rel="alternate" hreflang="ko" href="${escape(`${SITE_URL}${ko}`)}">`,
    `<link rel="alternate" hreflang="x-default" href="${escape(`${SITE_URL}${en}`)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:locale" content="${lang === "ko" ? "ko_KR" : "en_US"}">`,
    `<meta property="og:url" content="${escape(canonical)}">`,
    `<meta property="og:title" content="${escape(title)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
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
      url: `${SITE_URL}${toPath(route.routePath)}`,
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
