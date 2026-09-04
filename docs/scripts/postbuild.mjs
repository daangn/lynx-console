// 빌드된 HTML 을 훑어 sitemap.xml 과 robots.txt 를 만들어요.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  alternatePaths,
  DEFAULT_LOCALE,
  LOCALES,
  SITE_URL,
} from "../siteMeta.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "..", "doc_build");

function collectHtml(dir, base = "") {
  const routes = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.posix.join(base, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "static" ||
        entry.name === "demo" ||
        entry.name === "async"
      )
        continue;
      routes.push(...collectHtml(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith(".html") && entry.name !== "404.html") {
      routes.push(
        rel === "index.html"
          ? "/"
          : `/${rel.replace(/index\.html$/, "").replace(/\.html$/, "")}`,
      );
    }
  }
  return routes;
}

const routes = collectHtml(outDir).sort();
const today = new Date().toISOString().slice(0, 10);

const urls = routes
  .map((route) => {
    const alternates = alternatePaths(route);
    return [
      "  <url>",
      `    <loc>${SITE_URL}${route}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      ...LOCALES.map(
        (lang) =>
          `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_URL}${alternates[lang]}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${alternates[DEFAULT_LOCALE]}"/>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n");

fs.writeFileSync(
  path.join(outDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
);

fs.writeFileSync(
  path.join(outDir, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);

console.log(`[postbuild] sitemap.xml (${routes.length} urls), robots.txt`);
