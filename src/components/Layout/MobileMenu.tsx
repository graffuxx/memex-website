'use client';

import React, { useState } from 'react';
import styles from './MobileMenu.module.css';
import WalletButton from '@/components/Wallet/WalletButton';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  return (
    <>
      {/* Burger-Button (nur mobil sichtbar, per CSS) */}
      <button
        className={styles.menuButton}
        onClick={toggle}
        aria-label="Open menu"
      >
        <span className={styles.menuIcon} />
      </button>

      {open && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuPanel}>
            {/* Header oben im Panel */}
            <div className={styles.menuHeader}>
              <div className={styles.menuLogo}>
                <img
                  src="/background-card.png"
                  alt="MemeX Duelverse"
                  className={styles.menuLogoImage}
                />
                <span className={styles.menuLogoText}>MEMEX</span>
              </div>
              <button
                className={styles.closeButton}
                onClick={close}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Navigation */}
            <nav className={styles.menuNav}>
              <a href="/" onClick={close}>
                Home
              </a>
              <a href="/how-to-buy" className={styles.navItem}>
                HOW TO BUY
              </a>
              <a href="/presale" onClick={close} className={styles.presaleLink}>
                Presale
              </a>
              <a href="/how-to-play" onClick={close}>
                How to Play
              </a>
              <a href="/whitepaper" onClick={close}>
                Whitepaper
              </a>
              <a href="/socials" onClick={close}>
                Socials
              </a>
              <a href="/nft-shop" onClick={close}>
                NFT Shop
              </a>
              <a href="/account" onClick={close}>
                Account
              </a>
              <a href="/news" onClick={close}>
                News
              </a>
            </nav>

            {/* Login Optionen */}
            <div className={styles.loginSection}>
              <div className={styles.loginTitle}>Login</div>
              <button
                className={styles.loginOption}
                onClick={() => {
                  close();
                  window.location.href = '/account';
                }}
              >
                Wallet Login
              </button>
              <button
                className={styles.loginOption}
                onClick={() => {
                  close();
                  window.location.href = '/account';
                }}
              >
                Email Login
              </button>
            </div>

            {/* Wallet Button unten */}
            <div className={styles.menuWallet}>
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}