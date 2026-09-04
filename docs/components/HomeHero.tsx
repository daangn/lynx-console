import {
  normalizeHrefInRuntime,
  useLang,
  usePageData,
  withBase,
} from "rspress/runtime";
import { lynxExplorerUrl } from "../siteMeta.mjs";
import styles from "./HomeHero.module.css";

interface HeroAction {
  theme?: "brand" | "alt";
  text: string;
  link: string;
}

interface Hero {
  name?: string;
  tagline?: string;
  actions?: HeroAction[];
}

const TEXT = {
  en: {
    explorer: "Open in Lynx Explorer",
    openInTab: "Open the demo in a new tab",
  },
  ko: { explorer: "Lynx Explorer로 열기", openInTab: "새 탭에서 데모 열기" },
  zh: { explorer: "用 Lynx Explorer 打开", openInTab: "在新标签页打开演示" },
} as const;

export function HomeHero() {
  const { page } = usePageData();
  const lang = useLang();
  const t = TEXT[lang in TEXT ? (lang as keyof typeof TEXT) : "en"];
  const hero = (page.frontmatter?.hero ?? {}) as Hero;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.headline}>{hero.name}</h1>
          <p className={styles.tagline}>{hero.tagline}</p>
          <div className={styles.actions}>
            {hero.actions?.map((action) => (
              <a
                key={action.link}
                className={`${styles.action} ${
                  action.theme === "alt" ? styles.actionAlt : styles.actionBrand
                }`}
                href={normalizeHrefInRuntime(
                  withBase(action.link, page.routePath),
                )}
              >
                {action.text}
              </a>
            ))}
          </div>
          <div className={styles.explorerRow}>
            <img
              className={styles.qr}
              src={withBase("/lynx-explorer-qr.svg")}
              alt="QR code for the Lynx Explorer demo bundle"
              width={76}
              height={76}
            />
            <a className={styles.explorer} href={lynxExplorerUrl()}>
              {t.explorer}
            </a>
          </div>
        </div>
        <div className={styles.stage}>
          <div className={styles.phone}>
            <iframe
              className={styles.frame}
              src={withBase("/demo/")}
              title="lynx-console live demo"
              loading="lazy"
            />
          </div>
          <a
            className={styles.openInTab}
            href={withBase("/demo/")}
            target="_blank"
            rel="noreferrer"
          >
            {t.openInTab}
          </a>
        </div>
      </div>
    </section>
  );
}
