'use client';

import styles from './SocialsSection.module.css';

export default function SocialsSection() {
  return (
    <section className={styles.socialSection}>
      <div className={styles.videoWrapper}>
        <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
          <source src="/socialmedia-background.mp4" type="video/mp4" />
        </video>

        <div className={styles.fadeTopOverlay}></div>

        <div className={styles.overlayContent}>
          <h2 className={styles.title}>FOLLOW THE DUELVERSE</h2>
          <div className={styles.iconRow}>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/x.svg" alt="X" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/discord.svg" alt="Discord" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/instagram.svg" alt="Instagram" />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer">
              <img src="/icons/telegram.svg" alt="Telegram" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/youtube.svg" alt="YouTube" />
            </a>
          </div>
        </div>

        <div className={styles.fadeBottomOverlay}></div>
      </div>
    </section>
  );
}