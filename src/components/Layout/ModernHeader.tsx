'use client';

import React, { useState, useEffect } from 'react';
import styles from './ModernHeader.module.css';
import MobileMenu from './MobileMenu';

export default function ModernHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={styles.header}>
      <MobileMenu />

      <div className={`${styles.bar} ${scrolled ? styles.barScrolled : ''}`}>
        <div className={styles.container}>
          <div className={styles.leftGroup}>
            <a href="/" className={styles.logoLink}>
              <img
                src="/background-card.png"
                alt="MemeX Duelverse"
                className={styles.logoImage}
              />
            </a>
          </div>

          <nav className={styles.navbar}>
            <a href="/" className={styles.navItem}>
              HOME
            </a>
            <a href="/play" className={`${styles.navItem} ${styles.navItemPresale}`}>
              PLAY
            </a>
            <a href="/how-to-play" className={styles.navItem}>
              HOW TO PLAY
            </a>
            <a href="/collection" className={styles.navItem}>
              COLLECTION
            </a>
            <a href="/decks" className={styles.navItem}>
              DECKS
            </a>
            <a href="/socials" className={styles.navItem}>
              SOCIALS
            </a>
            <a href="/shop" className={styles.navItem}>
              SHOP
            </a>
            <a href="/account/private" className={styles.navItem}>
              ACCOUNT
            </a>
            <a href="/news" className={styles.navItem}>
              NEWS
            </a>
          </nav>

          <div className={styles.rightGroup}>
            <a href="/account" className={styles.loginButton}>
              LOGIN
            </a>

          </div>
        </div>
      </div>
    </header>
  );
}