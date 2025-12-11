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
      {/* Burger-Button – nur mobil sichtbar (per CSS) */}
      <button
        className={styles.menuButton}
        onClick={toggle}
        aria-label="Open menu"
      >
        <span className={styles.menuIconLine} />
        <span className={styles.menuIconLine} />
        <span className={styles.menuIconLine} />
      </button>

      {open && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuPanel}>
            <div className={styles.menuHeader}>
              <span className={styles.menuTitle}>MemeX Menu</span>
              <button
                className={styles.closeButton}
                onClick={close}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Login-Bereich (Wallet / Email) */}
            <div className={styles.menuLoginSection}>
              <div className={styles.menuLoginTitle}>Login</div>
              <div className={styles.menuLoginOptions}>
                <a href="/account" onClick={close}>
                  Wallet Login
                </a>
                <a href="/account" onClick={close}>
                  Email Login
                </a>
              </div>
            </div>

            <nav className={styles.menuNav}>
              <a href="/" onClick={close}>
                Home
              </a>
              <a href="/presale" onClick={close}>
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
            </nav>

            <div className={styles.menuWallet}>
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}