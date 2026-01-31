"use client";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function NewsPage() {
  const X_HANDLE = "MemeX_Duelverse"; // ohne @

  useEffect(() => {
    // Re-load X/Twitter widgets on client-side route transitions
    const w = window as any;
    if (w.twttr?.widgets?.load) {
      w.twttr.widgets.load();
      return;
    }

    // If the script isn't present yet, inject it once
    const existing = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
    if (existing) return;

    const s = document.createElement("script");
    s.src = "https://platform.twitter.com/widgets.js";
    s.async = true;
    s.onload = () => {
      const ww = window as any;
      ww.twttr?.widgets?.load?.();
    };
    document.body.appendChild(s);
  }, []);

  return (
    <main className={styles.page}>
      {/* Background Video */}
      <video
        className={styles.backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/socialmedia-background.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className={styles.overlay} />

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
                href={`https://x.com/${X_HANDLE}`}
                data-theme="dark"
                data-height="820"
                data-chrome="noheader nofooter transparent"
                data-dnt="true"
              >
                Posts by @{X_HANDLE}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}