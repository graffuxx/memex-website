'use client';

import styles from './CardPreview.module.css';

export default function CardPreview() {
  const cards = [
    {
      front: '/background-card.png',
      back: '/swollendoge-card.png',
      alt: 'Swollen Doge',
    },
    {
      front: '/background-card.png',
      back: '/roboelon-card.png',
      alt: 'Robo Elon',
    },
    {
      front: '/background-card.png',
      back: '/kekusmaximus-card.png',
      alt: 'Kekus Maximus',
    },
    {
      front: '/background-card.png',
      back: '/memelon-card.png',
      alt: 'Memelon',
    },
  ];

  return (
    <section className={styles.cardPreviewSection}>
      <div className={styles.videoWrapper}>
        <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
          <source src="/memex-cardpreview.mp4" type="video/mp4" />
        </video>
        <div className={styles.fadeTopOverlay}></div>
        <div className={styles.fadeBottomOverlay}></div>
      </div>

      <div className={styles.cardRow}>
        {cards.map((card, index) => (
          <div className={styles.cardContainer} key={index}>
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>
                <img src={card.front} alt="Card Front" />
              </div>
              <div className={styles.cardBack}>
                <img src={card.back} alt={card.alt} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}