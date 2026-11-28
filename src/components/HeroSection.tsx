'use client';

import { useEffect, useRef } from 'react';
import { DISCORD_INVITE } from '@/lib/discord';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const arena = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = arena.current;
    if (!video) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => {
      if (motion.matches) video.pause();
      else void video.play().catch(() => {});
    };

    syncMotion();
    motion.addEventListener('change', syncMotion);
    return () => motion.removeEventListener('change', syncMotion);
  }, []);

  return (
    <section className={styles.home}>
      <video
        ref={arena}
        className={styles.arenaVideo}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/home/arena-poster.jpg"
        aria-hidden="true"
      >
        <source src="/memex-hero.mp4" type="video/mp4" />
      </video>
      <div className={styles.sceneLighting} aria-hidden="true" />

      <div className={styles.hero}>
        <h1><img src="/home/memex-logo.webp" alt="MemeX Duelverse" /></h1>
        <div className={styles.heroActions}>
          <a className={styles.play} href="/play">
            <span className={styles.playIcon} aria-hidden="true" />
            Play Alpha
          </a>
          <a className={styles.discord} href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
            Join Discord <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className={styles.freeToPlay}>
          <p className={styles.freeToPlayTitle}>Free to play. <strong>Always.</strong></p>
        </div>
      </div>

      <a className={styles.headline} href="/news#shop-cosmetics" aria-labelledby="home-news-title">
        <img className={styles.spotlightCard} src="/game/assets/portraits/shop-v1/void-pepe-animated.webp" alt="" width={220} height={220} />
        <span className={styles.newsTag}><i aria-hidden="true" />Shop drop</span>
        <h2 id="home-news-title">New stickers.<br /> New faces.</h2>
        <p>Meet Loot Goblin, Panic Button and the animated portraits.</p>
        <span className={styles.newsLink}>See what's new <span aria-hidden="true">→</span></span>
      </a>

      <footer className={styles.legal}><a href="/impressum">Impressum</a></footer>
    </section>
  );
}
