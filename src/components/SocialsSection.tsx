'use client';

import React from 'react';
import styles from './SocialsSection.module.css';

export default function SocialsSection() {
  return (
    <section className={styles.socialSection}>
      <div className={styles.videoWrapper}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.backgroundVideo}
          preload="auto"
        >
          <source src="/socialmedia-background.mp4" type="video/mp4" />
        </video>

        {/* OPTIONAL: Wenn du KEINE Fades mehr willst -> einfach diese 2 Divs löschen */}
        <div className={styles.fadeTopOverlay} />
        <div className={styles.fadeBottomOverlay} />

        <div className={styles.overlayContent}>
          <div className={styles.title}>FOLLOW THE DUELVERSE</div>

          <div className={styles.iconRow}>
            <a href="#" aria-label="X">
              <img src="/social-x.png" alt="X" />
            </a>
            <a href="#" aria-label="Discord">
              <img src="/social-discord.png" alt="Discord" />
            </a>
            <a href="#" aria-label="Instagram">
              <img src="/social-instagram.png" alt="Instagram" />
            </a>
            <a href="#" aria-label="Telegram">
              <img src="/social-telegram.png" alt="Telegram" />
            </a>
            <a href="#" aria-label="YouTube">
              <img src="/social-youtube.png" alt="YouTube" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}