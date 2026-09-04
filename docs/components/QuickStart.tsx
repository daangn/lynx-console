import { useLang } from "rspress/runtime";
import styles from "./QuickStart.module.css";

const INSTALL = "npm install lynx-console";

const INIT = `// src/index.tsx
import {
  initLogMonitor,
  initNetworkMonitor,
} from "lynx-console/setup";

initLogMonitor();
initNetworkMonitor();`;

const RENDER = `// src/App.tsx
import LynxConsole from "lynx-console";

<view>
  {/* your app */}
  <LynxConsole />
</view>;`;

const TEXT = {
  en: {
    title: "Three steps to get it running",
    more: "Full guide →",
    moreLink: "/guide/getting-started",
    steps: ["Install", "Initialize at the entry point", "Render the component"],
  },
  ko: {
    title: "설치는 세 단계면 끝나요",
    more: "전체 가이드 →",
    moreLink: "/ko/guide/getting-started",
    steps: ["설치", "진입점에서 초기화", "컴포넌트 렌더"],
  },
  zh: {
    title: "三步就能跑起来",
    more: "完整指南 →",
    moreLink: "/zh/guide/getting-started",
    steps: ["安装", "在入口初始化", "渲染组件"],
  },
} as const;

export function QuickStart() {
  const lang = useLang();
  const t = TEXT[lang in TEXT ? (lang as keyof typeof TEXT) : "en"];
  const snippets = [INSTALL, INIT, RENDER];

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{t.title}</h2>
        <a className={styles.more} href={t.moreLink}>
          {t.more}
        </a>
      </div>
      <div className={styles.steps}>
        {t.steps.map((step, index) => (
          <div className={styles.step} key={step}>
            <div className={styles.stepHead}>
              <span className={styles.num}>{`0${index + 1}`}</span>
              {step}
            </div>
            <pre className={styles.code}>
              <code>{snippets[index]}</code>
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
