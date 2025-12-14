// src/app/news/page.tsx
import Script from "next/script";
import styles from "./page.module.css";

export default function NewsPage() {
  // Change this if your handle is different (WITHOUT @)
  const X_HANDLE = "memex_duelverse";

  return (
    <main className={styles.page}>
      <section className={styles.wrap}>
        <header className={styles.header}>
          <h1 className={styles.title}>NEWS</h1>
          <p className={styles.subtitle}>
            Live updates from our X feed. Follow the Duelverse.
          </p>
        </header>

        <div className={styles.card}>
          <div className={styles.glow} />
          <div className={styles.inner}>
            <div className={styles.feedHeader}>
              <div className={styles.badge}>LIVE FEED</div>
              <a
                className={styles.follow}
                href={`https://x.com/${X_HANDLE}`}
                target="_blank"
                rel="noreferrer"
              >
                Follow @{X_HANDLE}
              </a>
            </div>

            <div className={styles.timeline}>
              <a
                className="twitter-timeline"
                href={`https://twitter.com/${X_HANDLE}`}
                data-theme="dark"
                data-height="820"
                data-chrome="noheader nofooter transparent"
                data-dnt="true"
              >
                Posts by @{X_HANDLE}
              </a>

              <Script
                src="https://platform.twitter.com/widgets.js"
                strategy="afterInteractive"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}