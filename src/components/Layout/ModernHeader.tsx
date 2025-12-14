'use client';

import React, { useState, useEffect } from 'react';
import WalletButton from '@/components/Wallet/WalletButton';
import styles from './ModernHeader.module.css';
import MobileMenu from './MobileMenu';

export default function ModernHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      setLoginOpen(false);
    };

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
            <a href="/" className={styles.navItem}>HOME</a>
            <a href="/presale" className={`${styles.navItem} ${styles.navItemPresale}`}>PRESALE</a>
            <a href="/how-to-play" className={styles.navItem}>HOW TO PLAY</a>
            <a href="/whitepaper" className={styles.navItem}>WHITEPAPER</a>
            <a href="/socials" className={styles.navItem}>SOCIALS</a>
            <a href="/nft-shop" className={styles.navItem}>NFT SHOP</a>
            <a href="/account" className={styles.navItem}>ACCOUNT</a>
            <a href="/news" className={styles.navItem}>NEWS</a>
          </nav>

          <div className={styles.rightGroup}>
            <div className={styles.loginWrapper} onMouseLeave={() => setLoginOpen(false)}>
              <button
                type="button"
                className={styles.loginButton}
                onClick={() => setLoginOpen((p) => !p)}
              >
                LOGIN <span className={styles.loginCaret}>▾</span>
              </button>

              {loginOpen && (
                <div className={styles.loginDropdown}>
                  <a href="/account" className={styles.loginDropdownItem} onClick={() => setLoginOpen(false)}>
                    Wallet Login
                  </a>
                  <a href="/account" className={styles.loginDropdownItem} onClick={() => setLoginOpen(false)}>
                    Email Login
                  </a>
                </div>
              )}
            </div>

            <div className={styles.wallet}>
              <WalletButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}