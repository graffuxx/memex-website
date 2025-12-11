'use client';

import { useEffect, useState } from 'react';
import styles from './TickerBar.module.css';

const messages = [
  '⏳ MEMEX Presale starts Dec 20 – Level 1 is coming!',
  '💎 Level 1 = Best MEMEX rates – early supporters win!',
  '🎁 Random NFT drops for early presale buyers!',
  '⚔️ Help us fund the Duelverse – MEMEX is community-powered!',
];

export default function TickerBar() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!messages.length) return;

    const interval = setInterval(() => {
      // kleiner Fade-Out/Fade-In Effekt
      setFade(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % messages.length);
        setFade(false);
      }, 250);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!messages.length) return null;

  return (
    <div className={styles.tickerWrapper}>
      <div className={styles.tickerInner}>
        <span className={styles.icon}>🎉</span>
        <span
          className={`${styles.text} ${fade ? styles.fade : ''}`}
        >
          {messages[current]}
        </span>
      </div>
    </div>
  );
}