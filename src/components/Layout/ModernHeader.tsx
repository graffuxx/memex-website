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
      {/* Mobile Menu (Burger + Overlay) */}
      <MobileMenu />

      {/* Desktop Navigation */}
      <div className={styles.container}>
        <nav className={styles.navbar}>
          <a href="/">HOME</a>
          <a href="/presale">PRESALE</a>
          <a href="/how-to-play">HOW TO PLAY</a>
          <a href="/whitepaper">WHITEPAPER</a>
          <a href="/socials">SOCIALS</a>
          <a href="/nft-shop">NFT SHOP</a>
          <a href="/account">ACCOUNT</a>
        </nav>

        <div className={styles.wallet}>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}