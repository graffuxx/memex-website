'use client';

import { useState } from 'react';
import styles from './MobileMenu.module.css';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.menuButton}>
        ☰
      </button>

      {isOpen && (
        <div className={styles.menuOverlay}>
          <button onClick={() => setIsOpen(false)} className={styles.closeButton}>✕</button>
          <nav className={styles.menuNav}>
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/presale" onClick={() => setIsOpen(false)}>Presale</Link>
            <Link href="/whitepaper" onClick={() => setIsOpen(false)}>Whitepaper</Link>
            <Link href="/socials" onClick={() => setIsOpen(false)}>Socials</Link>
            <Link href="/nft-shop" onClick={() => setIsOpen(false)}>NFT Shop</Link>
            <Link href="/account" onClick={() => setIsOpen(false)}>Account</Link>
          </nav>
        </div>
      )}
    </>
  );
}