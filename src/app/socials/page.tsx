'use client';

import SocialsSection from '@/components/SocialsSection';
import styles from './page.module.css';

export default function SocialsPage() {
  return (
    <div className={styles.page}>
      <video autoPlay muted playsInline className={styles.backgroundVideo}>
        <source src="/socialmedia-background.mp4" type="video/mp4" />
      </video>

      <div className={styles.content}>
        <SocialsSection />
      </div>
    </div>
  );
}