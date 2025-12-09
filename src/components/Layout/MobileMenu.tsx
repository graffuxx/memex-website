'use client';

import React, { useState } from 'react';
import styles from './MobileMenu.module.css';
import WalletButton from '@/components/Wallet/WalletButton';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <>
      {/* Burger-Button (nur mobil sichtbar, per CSS) */}
      <button className={styles.menuButton} onClick={toggle} aria-label="Open menu">
        <span className={styles.menuIcon} />
      </button>

      {open && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuHeader}>
            <span className={styles.menuTitle}>Menu</span>
            <button
              className={styles.closeButton}
              onClick={toggle}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className={styles.menuNav}>
            <a href="/" onClick={toggle}>
              Home
            </a>
            <a href="/presale" onClick={toggle}>
              Presale
            </a>
            <a href="/how-to-play" onClick={toggle}>
              How to Play
            </a>
            <a href="/whitepaper" onClick={toggle}>
              Whitepaper
            </a>
            <a href="/socials" onClick={toggle}>
              Socials
            </a>
            <a href="/nft-shop" onClick={toggle}>
              NFT Shop
            </a>
            <a href="/account" onClick={toggle}>
              Account
            </a>
          </nav>

          <div className={styles.menuWallet}>
            <WalletButton />
          </div>
        </div>
      )}
    </>
  );
}