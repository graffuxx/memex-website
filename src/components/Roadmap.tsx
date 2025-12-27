'use client';

import styles from './Roadmap.module.css';

export default function Roadmap() {
  return (
    <section className={styles.roadmapSection}>
      {/* Hintergrundvideo */}
      <div className={styles.videoWrapper}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={styles.backgroundVideo}
        >
          <source src="/memex-ourmission.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Inhaltsbereich */}
      <div className={styles.content}>
        <h2 className={styles.title}>MEMEX ROADMAP</h2>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Early 2026</h3>
            <p>Presale Launch – Support the Duelverse and secure your MEMEX tokens.</p>
          </div>

          <div className={styles.card}>
            <h3>Spring 2026</h3>
            <p>Exchange Listings – MEMEX hits the markets.</p>
          </div>

          <div className={styles.card}>
            <h3>Summer 2026</h3>
            <p>NFT Card Shop – Limited early access with collectible MemeX NFTs.</p>
          </div>

          <div className={styles.card}>
            <h3>Fall 2026</h3>
            <p>Alpha Launch on STEAM – First playable version for early supporters.</p>
          </div>

          <div className={styles.card}>
            <h3>Winter 2026</h3>
            <p>Beta Release on STEAM – Expanded access and gameplay testing.</p>
          </div>

          <div className={styles.card}>
            <h3>2027</h3>
            <p>Full Game Launch on STEAM – Official release of MemeX Duelverse.</p>
          </div>
        </div>

        <div className={styles.note}>
          <strong>Thank you, Presale Supporters!</strong>
          <br />
          Every early backer will receive exclusive NFT rewards for funding the Memevolution.
        </div>
      </div>
    </section>
  );
}