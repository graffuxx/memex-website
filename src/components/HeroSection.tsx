'use client';

import { DISCORD_INVITE } from '@/lib/discord';
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
    <a href="/play" className={styles.steamTeaser} aria-label="Play Alpha">
      <span className={styles.steamTeaserText}>PLAY ALPHA</span>
    </a>
    <a className={styles.discordLink} href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
      Join Discord
    </a>
  </div>
</section>
  );
}
