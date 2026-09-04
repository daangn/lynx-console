import path from "node:path";
import { defineConfig } from "rspress/config";

const GITHUB_URL = "https://github.com/daangn/lynx-console";

export default defineConfig({
  root: "src",
  outDir: "doc_build",
  title: "lynx-console",
  description:
    "An in-app developer console that can be embedded in Lynx apps. View console logs, network requests, and performance metrics in real time.",
  icon: "/favicon.svg",
  lang: "en",
  locales: [
    {
      lang: "en",
      label: "English",
      title: "lynx-console",
      description: "An in-app developer console for Lynx apps",
    },
    {
      lang: "ko",
      label: "한국어",
      title: "lynx-console",
      description: "Lynx 앱에 내장할 수 있는 인앱 개발자 콘솔",
    },
  ],
  globalStyles: path.resolve("styles/global.css"),
  markdown: {
    checkDeadLinks: true,
  },
  themeConfig: {
    socialLinks: [{ icon: "github", mode: "link", content: GITHUB_URL }],
    locales: [
      {
        lang: "en",
        label: "English",
        outlineTitle: "On this page",
        prevPageText: "Previous",
        nextPageText: "Next",
        editLink: {
          docRepoBaseUrl: `${GITHUB_URL}/tree/main/docs/src`,
          text: "Edit this page on GitHub",
        },
        nav: [
          { text: "Guide", link: "/guide/getting-started" },
          { text: "API", link: "/api/" },
          { text: "Demo", link: "/guide/demo" },
        ],
        sidebar: {
          "/guide/": [
            {
              text: "Guide",
              items: [
                { text: "Introduction", link: "/guide/introduction" },
                { text: "Getting Started", link: "/guide/getting-started" },
                { text: "Custom Tabs & Ref", link: "/guide/customizing" },
                { text: "Try the Demo", link: "/guide/demo" },
              ],
            },
          ],
          "/api/": [
            {
              text: "API",
              items: [{ text: "API Reference", link: "/api/" }],
            },
          ],
        },
      },
      {
        lang: "ko",
        label: "한국어",
        outlineTitle: "목차",
        prevPageText: "이전",
        nextPageText: "다음",
        editLink: {
          docRepoBaseUrl: `${GITHUB_URL}/tree/main/docs/src`,
          text: "GitHub에서 이 페이지 수정하기",
        },
        nav: [
          { text: "가이드", link: "/ko/guide/getting-started" },
          { text: "API", link: "/ko/api/" },
          { text: "데모", link: "/ko/guide/demo" },
        ],
        sidebar: {
          "/ko/guide/": [
            {
              text: "가이드",
              items: [
                { text: "소개", link: "/ko/guide/introduction" },
                { text: "시작하기", link: "/ko/guide/getting-started" },
                { text: "커스텀 탭과 ref", link: "/ko/guide/customizing" },
                { text: "데모 실행해보기", link: "/ko/guide/demo" },
              ],
            },
          ],
          "/ko/api/": [
            {
              text: "API",
              items: [{ text: "API 레퍼런스", link: "/ko/api/" }],
            },
          ],
        },
      },
    ],
  },
});
