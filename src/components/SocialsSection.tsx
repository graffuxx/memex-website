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
          preload="auto"
          className={styles.backgroundVideo}
        >
          <source src="/socialmedia-background.mp4" type="video/mp4" />
        </video>

        {/* Keine “Trennschatten” mehr – raus damit */}
        {/* <div className={styles.fadeTopOverlay} />
        <div className={styles.fadeBottomOverlay} /> */}

        <div className={styles.overlayContent}>
          <div className={styles.title}>FOLLOW THE DUELVERSE</div>

          <div className={styles.iconRow}>
            {/* WICHTIG: Das sind die Standard-Pfade. Falls deine Icons anders heißen,
               benenne die Dateien im /public so um, damit du NICHTS mehr am Code anfassen musst. */}
            <a href="#" aria-label="X">
              <img src="/x.png" alt="X" />
            </a>

            <a href="#" aria-label="Discord">
              <img src="/discord.png" alt="Discord" />
            </a>

            <a href="#" aria-label="Instagram">
              <img src="/instagram.png" alt="Instagram" />
            </a>

            <a href="#" aria-label="Telegram">
              <img src="/telegram.png" alt="Telegram" />
            </a>

            <a href="#" aria-label="YouTube">
              <img src="/youtube.png" alt="YouTube" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}