'use client';

import React, { useState } from 'react';
import styles from './MobileMenu.module.css';
import {usePathname} from 'next/navigation';
import {NAV_LINKS,activeNav} from './navigation';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const path=usePathname();

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  return (
    <>
      {/* Burger-Button (nur mobil sichtbar, per CSS) */}
      <button
        className={styles.menuButton}
        onClick={toggle}
        aria-label={open?"Close menu":"Open menu"}
        aria-expanded={open}
        aria-controls="mobile-main-navigation"
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

            <nav id="mobile-main-navigation" className={styles.menuNav} aria-label="Mobile navigation">
              {NAV_LINKS.map(([url,label])=><a key={url} href={url} onClick={close} aria-current={activeNav(path,url)?'page':undefined}>{label}</a>)}
          </nav>
          </div>
        </div>
      )}
    </>
  );
}