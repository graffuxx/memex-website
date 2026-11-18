'use client';

import React, { useState } from 'react';
import styles from './MobileMenu.module.css';

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
                className={styles.loginOption}
                onClick={() => {
                  close();
                  window.location.href = '/account';
                }}
              >
                Email Login
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}