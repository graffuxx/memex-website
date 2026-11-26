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
            New cards, alpha updates and news from the Duelverse.
          </p>
        </header>

        <article className={styles.questNews}>
          <div className={styles.questNewsArt}>
            <img
              src="/game/assets/cards/frame-v21/memex-back.webp"
              alt="MemeX Duelverse card back"
            />
          </div>
          <div>
            <div className={styles.badge}>
              IN DEVELOPMENT · <time dateTime="2026-11-26">26 NOV 2026</time>
            </div>
            <h2>New cards are coming to the Duelverse.</h2>
            <p>
              New memes. New moves. We’re working on the next additions to the
              MemeX card collection, with more personalities to discover and
              new possibilities for your deck.
            </p>
            <p>
              Alongside the new cards, we’re continuing to refine abilities,
              balance and the flow of the browser alpha. We’ll share card
              previews and development updates here as the next additions take
              shape.
            </p>
            <p>
              <strong>Your memes. Your game.</strong> Try the current alpha,
              find your favourite cards and tell us what you’d like to see next.
              Release details for the new cards will follow when they’re ready.
            </p>
            <a className={styles.follow} href="/play">Play the alpha</a>
          </div>
        </article>

        <article className={styles.questNews}>
          <div className={styles.questNewsArt}><img src="/game/assets/boosters/alpha-v36/alpha-pack.webp" alt="Alpha Booster quest reward"/></div>
          <div><div className={styles.badge}>ALPHA UPDATE · 21 NOV 2026</div><h2>Play. Win. Bring your next rival.</h2><p>Quests are live. Complete Random matchmaking rounds against humans or AI, win duels and invite active new players to earn Alpha Boosters. Your player area now shows every milestone, saved progress and rewards ready to claim.</p><p>Play milestones: <strong>5 / 25 / 100 / 250 rounds</strong>. Win milestones: <strong>3 / 10 / 50 / 100 rounds</strong>. All milestones are one-time rewards.</p><p>At <strong>5 qualified friends</strong>, unlock Recruiter Diamond Doge. At <strong>15</strong>, unlock Recruiter Void Pepe. These separate artworks keep the original card values and cannot be crafted or dismantled.</p><details><summary>How friend referrals qualify</summary><p>New accounts must register through your personal link, confirm their email and finish 10 random rounds against at least 2 human opponents across 3 different UTC days. Registration alone does not earn rare rewards. Each new player has one inviter. AI backup counts for play/win quests and win XP, but not referral qualification or skill-based PvP titles. Training, private matches, forfeits and unfinished rounds do not advance quests.</p></details><p>Five cards per booster, at least one Silver or better. Existing pack odds, welcome gifts and shop prices remain unchanged.</p><a className={styles.follow} href="/account/private/quests">View your quests</a></div>
        </article>
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