import { usePageData } from "rspress/runtime";
import styles from "./Features.module.css";

interface Feature {
  title?: string;
  details?: string;
}

export function Features() {
  const { page } = usePageData();
  const features = (page.frontmatter?.features ?? []) as Feature[];

  if (features.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {features.map((feature) => (
          <div className={styles.card} key={feature.title}>
            <h2 className={styles.title}>{feature.title}</h2>
            <p className={styles.details}>{feature.details}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
