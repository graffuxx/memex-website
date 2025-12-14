'use client';

import React from 'react';
import styles from './PageShell.module.css';

type Props = {
  children: React.ReactNode;
  /** z.B. "/socialmedia-background.mp4" oder "/some-bg.jpg" */
  videoSrc?: string;
  imageSrc?: string;
  /** optional: zusätzliche Overlay-Intensität */
  overlay?: 'soft' | 'strong';
};

export default function PageShell({
  children,
  videoSrc,
  imageSrc,
  overlay = 'soft',
}: Props) {
  return (
    <div className={styles.shell}>
      {/* FULLSCREEN BACKGROUND LAYER */}
      <div className={styles.bgLayer} aria-hidden="true">
        {videoSrc ? (
          <video
            className={styles.bgVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : imageSrc ? (
          <div
            className={styles.bgImage}
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
        ) : (
          <div className={styles.bgFallback} />
        )}

        <div
          className={`${styles.bgOverlay} ${
            overlay === 'strong' ? styles.overlayStrong : styles.overlaySoft
          }`}
        />
      </div>

      {/* CONTENT */}
      <main className={styles.content}>{children}</main>
    </div>
  );
}