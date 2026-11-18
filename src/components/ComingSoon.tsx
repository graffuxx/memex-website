'use client';

import styles from './ComingSoon.module.css';

export default function ComingSoon() {
  return (
    <section className={styles.comingSoonSection}>
      <div className={styles.videoWrapper}>
        <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
          <source src="/comingsoon-background.mp4" type="video/mp4" />
        </video>
        <div className={styles.fadeTopOverlay}></div>
        <div className={styles.fadeBottomOverlay}></div>
      </div>

      <div className={styles.contentWrapper}>
        <h2 className={styles.title}>BIG THINGS ARE COMING TO THE DUELVERSE</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3>CARD COLLECTION</h3>
            <p>Collect and explore MemeX cards and their artwork variants.</p>
          </div>
          <div className={styles.card}>
            <h3>PLAY REWARDS</h3>
            <p>Earned game currency for free boosters is planned. Rewards are not active yet.</p>
          </div>
          <div className={styles.card}>
            <h3>ARENA SKINS</h3>
            <p>More looks for the Duelverse are planned, with the same game rules.</p>
          </div>
          <div className={styles.card}>
            <h3>RELEASE: ALPHA / BETA</h3>
            <p>The browser alpha is playable now against a demo opponent.</p>
          </div>
          <div className={styles.card}>
            <h3>FINAL RELEASE</h3>
            <p>Online duels and further game content are in development.</p>
          </div>
          <div className={styles.card}>
            <h3>BOOSTER SHOP</h3>
            <p>Boosters and cosmetic items are planned. Purchases are not enabled yet.</p>
          </div>
        </div>
      </div>
    </section>
  );
}