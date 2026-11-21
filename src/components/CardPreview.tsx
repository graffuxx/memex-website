'use client';

import { useState } from 'react';
import GameCardFace from './portal/GameCardFace';
import { DEFINITIONS, RARITIES, getVariant } from '../../public/game/platform/catalog.mjs';
import { UNIVERSAL_CARD_BACK } from '../../public/game/platform/edition36.mjs';
import styles from './CardPreview.module.css';

const cards = ['pepe:rare', 'doge:epic', 'disaster-girl:legendary', 'grumpy-cat:mythic'].map(id => {
  const variant = getVariant(id)!;
  return {
    variant,
    card: DEFINITIONS.find(card => card.id === variant.definitionId)!,
    rarity: RARITIES.find(rarity => rarity.id === variant.rarity)!,
  };
});

export default function CardPreview() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  return (
    <section className={styles.cardPreviewSection} aria-label="Explore Alpha cards">
      <div className={styles.videoWrapper}>
        <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
          <source src="/memex-cardpreview.mp4" type="video/mp4" />
        </video>
        <div className={styles.fadeTopOverlay}></div>
        <div className={styles.fadeBottomOverlay}></div>
      </div>

      <div className={styles.cardRow}>
        {cards.map(({card, variant, rarity}) => (
          <button
            type="button"
            className={styles.cardContainer}
            key={variant.id}
            aria-label={`Flip ${card.name} · ${rarity.name}`}
            aria-pressed={!!flipped[variant.id]}
            onClick={() => setFlipped(previous => ({...previous, [variant.id]: !previous[variant.id]}))}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>
                <img src={UNIVERSAL_CARD_BACK} alt="Universal X card back" />
              </div>
              <div className={`${styles.cardBack} dv-portal`}>
                <GameCardFace card={card} variant={variant} color={rarity.color}/>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
