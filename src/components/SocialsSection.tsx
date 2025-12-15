'use client';

import React from 'react';
import styles from './SocialsSection.module.css';

type Props = {
  mode?: 'section' | 'page';
};

export default function SocialsSection({ mode = 'section' }: Props) {
  const rootClass =
    mode === 'page'
      ? `${styles.socialSection} ${styles.pageMode}`
      : styles.socialSection;

  return (
    <section className={rootClass}>
      {/* Video Layer */}
      <div className={styles.videoLayer}>
        <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
          <source src="/socialmedia-background.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h2 className={styles.title}>FOLLOW THE DUELVERSE</h2>

        <div className={styles.iconRow}>
          <a className={styles.iconBtn} href="#" aria-label="X">
            <span className={styles.icon}>
              {/* X */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.7l-5.2-6.7L5.5 22H2.4l7.3-8.4L1 2h6.8l4.7 6 6.4-6z" />
              </svg>
            </span>
          </a>

          <a className={styles.iconBtn} href="#" aria-label="Discord">
            <span className={styles.icon}>
              {/* Discord */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 4.5a16 16 0 0 0-4-1.5l-.2.4a14 14 0 0 1 3 1.3 11 11 0 0 0-8.6 0 14 14 0 0 1 3-1.3L13 3a16 16 0 0 0-4 1.5C6.6 8 6 11.4 6.2 14.7a16 16 0 0 0 4.9 2.5l.6-.8a10 10 0 0 1-1.6-.8l.4-.3a11 11 0 0 0 9.1 0l.4.3a10 10 0 0 1-1.6.8l.6.8a16 16 0 0 0 4.9-2.5C23.4 11.4 22.8 8 20 4.5zM9.6 13.8c-.7 0-1.2-.6-1.2-1.4S9 11 9.6 11s1.2.6 1.2 1.4-.5 1.4-1.2 1.4zm4.8 0c-.7 0-1.2-.6-1.2-1.4S13.8 11 14.4 11s1.2.6 1.2 1.4-.5 1.4-1.2 1.4z" />
              </svg>
            </span>
          </a>

          <a className={styles.iconBtn} href="#" aria-label="Instagram">
            <span className={styles.icon}>
              {/* Instagram */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.5-.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z" />
              </svg>
            </span>
          </a>

          <a className={styles.iconBtn} href="#" aria-label="Telegram">
            <span className={styles.icon}>
              {/* Telegram */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.8 4.2 2.9 11.6c-1.3.5-1.3 1.2-.2 1.6l4.9 1.5 1.9 5.7c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.8l3.2-15.1c.3-1.3-.5-1.8-1.6-1.4zM8.3 14.2l10.8-6.7c.5-.3 1-.1.6.3l-8.7 7.8-.3 3.2-.7-2.4-1.7-.5z" />
              </svg>
            </span>
          </a>

          <a className={styles.iconBtn} href="#" aria-label="YouTube">
            <span className={styles.icon}>
              {/* YouTube */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.6 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C15 3.6 12 3.6 12 3.6h0s-3 0-6.3.3c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S2 9.1 2 11v2c0 1.9.4 3.8.4 3.8s.2 1.6.9 2.3c.9.9 2.1.9 2.7 1 2 .2 6 .3 6 .3s3 0 6.3-.3c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3S22 14.9 22 13v-2c0-1.9-.4-3.8-.4-3.8zM10 15.5V8.5L16 12l-6 3.5z" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}