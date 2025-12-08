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
      {/* Mobiles Menü */}
      <MobileMenu />

      {/* Desktop-Navigation */}
      <div className={styles.container}>
        <div className={styles.navbar}>
          <a href="/">Home</a>
          <a href="/presale">Presale</a>
          <a href="/how-to-play">How to Play</a>   {/* ← NEUER REITER */}
          <a href="/whitepaper">Whitepaper</a>
          <a href="/socials">Socials</a>
          <a href="/nft-shop">NFT Shop</a>
          <a href="/account">Account</a>
        </div>

        <div className={styles.wallet}>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}