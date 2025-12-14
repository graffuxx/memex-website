'use client';

import React from 'react';
import SocialSection from '@/components/SocialsSection';
import styles from './page.module.css';

export default function SocialsPage() {
  return (
    <div className={styles.pageWrapper}>
      <video
        className={styles.backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/socialmedia-background.mp4" type="video/mp4" />
      </video>

      <div className={styles.backgroundOverlay} />

      <div className={styles.content}>
        <SocialSection />
      </div>
    </div>
  );
}