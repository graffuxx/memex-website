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
            <h3>NFT CARD SHOP</h3>
            <p>Collect, trade and flex MemeX cards. Launching soon!</p>
          </div>
          <div className={styles.card}>
            <h3>STAKING</h3>
            <p>Stake your MemeX tokens and earn juicy rewards. Coming soon!</p>
          </div>
          <div className={styles.card}>
            <h3>EXCHANGE LISTING</h3>
            <p>After the presale ends, MemeX will hit the markets. Stay tuned!</p>
          </div>
          <div className={styles.card}>
            <h3>RELEASE: ALPHA / BETA</h3>
            <p>Playable test versions will launch on Steam in 2026. All presale participants will receive early access keys.</p>
          </div>
          <div className={styles.card}>
            <h3>FINAL RELEASE</h3>
            <p>The full game will be released cross-platform: PC – Android – Apple</p>
          </div>
          <div className={styles.card}>
            <h3>MARKETPLACE 2.0</h3>
            <p>Trade NFTs, earn crypto rewards, and use SOL, MEMEX and other tokens for in-game purchases. The future of web3 commerce is here.</p>
          </div>
        </div>
      </div>
    </section>
  );
}