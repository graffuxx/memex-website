'use client';
import { useState } from 'react';
import styles from './NFTShop.module.css';

const cards = [
  {
    id: 1,
    name: 'SWOLLEN DOGE',
    description: 'Legendary card with Doge strength and infinite memes.',
    price: 'TBD SOL / MEMEX',
    image: '/background-card.png',
  },
  {
    id: 2,
    name: 'MEMELON',
    description: 'Elon meets meme – a SpaceX-powered fusion of madness.',
    price: 'TBD SOL / MEMEX',
    image: '/background-card.png',
  },
  {
    id: 3,
    name: 'ROBO ELON',
    description: 'Cybernetic meme titan with Tesla energy.',
    price: 'TBD SOL / MEMEX',
    image: '/background-card.png',
  },
  {
    id: 4,
    name: 'KEKUS',
    description: 'Ancient frog god of chaos and memetic power.',
    price: 'TBD SOL / MEMEX',
    image: '/background-card.png',
  },
  {
    id: 5,
    name: 'VOID PEPE',
    description: 'From the MemeX galaxy – rarest form of dimensional pepe.',
    price: 'TBD SOL / MEMEX',
    image: '/background-card.png',
  },
];

export default function NFTShop() {
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <section className={styles.nftShopSection}>
      <video autoPlay muted playsInline className={styles.backgroundVideo}>
        <source src="/memex-nftshop.mp4" type="video/mp4" />
      </video>

      <h2 className={styles.heading}>NFT CARD SHOP <span>— COMING SOON</span></h2>

      <div className={styles.cardGrid}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={styles.cardBox}
            onClick={() => setSelectedCard(card)}
          >
            <img src={card.image} alt={card.name} className={styles.cardImage} />
            <h3>{card.name}</h3>
            <p>{card.price}</p>
            <button className={styles.comingSoonBtn}>COMING SOON</button>
          </div>
        ))}
      </div>

      {selectedCard && (
        <div
          className={styles.popupOverlay}
          onClick={() => setSelectedCard(null)}
        >
          <div
            className={styles.popupBox}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedCard.image}
              alt={selectedCard.name}
              className={styles.popupImage}
            />
            <div className={styles.popupContent}>
              <h2>{selectedCard.name}</h2>
              <p>{selectedCard.description}</p>
              <p className={styles.popupPrice}>{selectedCard.price}</p>
              <button className={styles.buyBtn}>BUY NOW</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}