'use client';

import React, { useState, useEffect } from 'react';
import WalletButton from '@/components/Wallet/WalletButton';
import styles from './ModernHeader.module.css';
import MobileMenu from './MobileMenu';

export default function ModernHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Mobile: Burger links */}
        <div className={styles.mobileOnly}>
          <MobileMenu />
        </div>

        {/* Desktop: Navigation mittig/links */}
        <nav className={styles.navbar}>
          <a href="/" className={styles.navLink}>Home</a>
          <a href="/presale" className={styles.navLink}>Presale</a>
          <a href="/how-to-play" className={styles.navLink}>How to Play</a>
          <a href="/whitepaper" className={styles.navLink}>Whitepaper</a>
          <a href="/socials" className={styles.navLink}>Socials</a>
          <a href="/nft-shop" className={styles.navLink}>NFT Shop</a>
          <a href="/account" className={styles.navLink}>Account</a>
        </nav>

        {/* Rechts: Wallet-Button – immer sichtbar */}
        <div className={styles.walletWrapper}>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}