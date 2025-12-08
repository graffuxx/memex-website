'use client';

import styles from './MissionSection.module.css';

export default function MissionSection() {
  return (
    <section className={styles.mission}>
      <div className={styles.fadeTop}></div>
      <div className={styles.videoWrapper}>
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/memex-ourmission.mp4" type="video/mp4" />
        </video>
       <div className={styles.fadeBottomOverlay}></div>
      </div>

      <div className={styles.textContent}>
        <h2>OUR MISSION</h2>
        <p>
          MemeX empowers players with meme-powered strategy, community-driven gameplay
          and real ownership through NFTs and Solana integration. This is not just a
          card game – it’s a Memevolution.
        </p>
      </div>
    </section>
  );
}