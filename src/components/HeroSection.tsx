'use client';

import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
<section className={styles.hero}>
  <div className={styles.heroVideoWrapper}>
    <video autoPlay muted loop playsInline className={styles.heroVideo}>
      <source src="/memex-hero.mp4" type="video/mp4" />
    </video>
    <div className={styles.fadeBottom}></div>
  </div>

  <div className={styles.logoOverlay}>
    <img src="/memex-mainlogo.png" alt="Memex Logo Overlay" />
  </div>

  <div className={styles.heroContent}>
    
<div className={styles.steamTeaser} aria-label="Coming soon on Steam">
  <span className={styles.steamTeaserText}>COMING SOON ON STEAM!</span>
  <img
    src="/steam-logo.png"
    alt="Steam"
    className={styles.steamLogo}
  />
</div>

    <a href="/presale" className={styles.cta}>Join Presale</a>
  </div>
</section>
  );
}