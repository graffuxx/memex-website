'use client';

import React from 'react';
import styles from './SocialsSection.module.css';

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.7l-5.2-6.7L5.2 22H2l7.3-8.4L1 2h6.9l4.7 6.1L18.9 2zm-1.2 18h1.7L7.8 3.9H6L17.7 20z" />
    </svg>
  );
}

function IconDiscord() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 4.6a16.2 16.2 0 0 0-4.1-1.3l-.2.5a15 15 0 0 1 3.2 1.3c-1.4-1-3.2-1.7-5-2a.2.2 0 0 0-.2.1l-.4 1a14.4 14.4 0 0 0-2.6 0l-.4-1a.2.2 0 0 0-.2-.1c-1.8.3-3.6 1-5 2a15 15 0 0 1 3.2-1.3l-.2-.5A16.2 16.2 0 0 0 4 4.6C1.8 8 1.2 11.3 1.4 14.6c0 .1 0 .2.1.2A16.3 16.3 0 0 0 6.3 17a.2.2 0 0 0 .2-.1l.9-1.4a.2.2 0 0 0-.1-.3c-.7-.3-1.4-.7-2-1.2a.2.2 0 0 1 0-.3l.4-.3a.2.2 0 0 1 .2 0c4.2 1.9 8.7 1.9 12.8 0a.2.2 0 0 1 .2 0l.4.3a.2.2 0 0 1 0 .3c-.6.5-1.3.9-2 1.2a.2.2 0 0 0-.1.3l.9 1.4a.2.2 0 0 0 .2.1 16.3 16.3 0 0 0 4.8-2.2c.1 0 .1-.1.1-.2.3-3.7-.5-7-2.6-10zM8.4 13.6c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7.2 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4z" />
      <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      <path d="M17.6 6.4a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.9 4.6 19 20.8c-.2 1.1-.8 1.4-1.6.9l-4.4-3.2-2.1 2c-.2.2-.4.4-.9.4l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2l-10.6 6.7-4.6-1.4c-1-.3-1-1 .2-1.4L20 3.9c.9-.3 1.7.2 1.9.7z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.8 12 4.8 12 4.8s-5.9 0-7.6.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8z" />
      <path d="M10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  );
}

export default function SocialsSection() {
  return (
    <section className={styles.socialSection}>
      {/* FULLSCREEN VIDEO BACKGROUND (wie NFTShop) */}
      <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
        <source src="/socialmedia-background.mp4" type="video/mp4" />
      </video>

      <div className={styles.content}>
        <h2 className={styles.title}>FOLLOW THE DUELVERSE</h2>

        <div className={styles.iconRow}>
          <a className={styles.iconBtn} href="#" aria-label="X">
            <span className={styles.icon}><IconX /></span>
          </a>
          <a className={styles.iconBtn} href="#" aria-label="Discord">
            <span className={styles.icon}><IconDiscord /></span>
          </a>
          <a className={styles.iconBtn} href="#" aria-label="Instagram">
            <span className={styles.icon}><IconInstagram /></span>
          </a>
          <a className={styles.iconBtn} href="#" aria-label="Telegram">
            <span className={styles.icon}><IconTelegram /></span>
          </a>
          <a className={styles.iconBtn} href="#" aria-label="YouTube">
            <span className={styles.icon}><IconYouTube /></span>
          </a>
        </div>
      </div>
    </section>
  );
}