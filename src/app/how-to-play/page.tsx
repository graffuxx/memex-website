// src/app/how-to-play/page.tsx
'use client';

import styles from './HowToPlay.module.css';

export default function HowToPlayPage() {
  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>How to Play MemeX: Duelverse</h1>

      <div className={styles.section}>
        <h2>What Is MemeX?</h2>
        <p>
          MemeX: Duelverse is a strategic meme trading card game played on a hex-based battlefield.
          Players place cards, flip opponents’ cards through number and element advantages, and battle
          for control of the board. The player who controls the most cards at the end of a round wins
          that round.
        </p>
      </div>

      <div className={styles.section}>
        <h2>The Battlefield</h2>
        <p>
          All matches are played on the MemeX hex-grid board. Each position on the field can hold
          exactly one card. Once the board is full, the round ends and both players count how many
          cards they control.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Start of the Match</h2>
        <p>
          At the start of a match it is randomly decided who goes first. Players then take turns placing
          one card at a time on any free position on the field.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Numbers & Flipping Cards</h2>
        <p>
          Each card has a base number that represents its strength. When you place a card next to an
          opponent&apos;s card:
        </p>
        <ul>
          <li>
            If your number is higher, the adjacent opponent card is <strong>flipped</strong> and becomes yours.
          </li>
          <li>
            Element advantages can give your card a bonus and help you flip stronger enemy cards.
          </li>
        </ul>
        <p>
          With clever placement you can flip entire sections of the field and turn the round at the
          last second.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Element System</h2>
        <p>
          Every card belongs to one of five launch elements. Elements interact with each other and
          create clear strengths and weaknesses:
        </p>

        <ul>
          <li><strong>Light (☀️)</strong> beats <strong>Dark (💀)</strong></li>
          <li><strong>Dark (💀)</strong> beats <strong>Water (💧)</strong></li>
          <li><strong>Water (💧)</strong> beats <strong>Electric (⚡)</strong></li>
          <li><strong>Electric (⚡)</strong> beats <strong>Plant (🍃)</strong></li>
          <li><strong>Plant (🍃)</strong> beats <strong>Light (☀️)</strong></li>
        </ul>

        <p>
          When your element has the advantage in this cycle, your card gains a small effective bonus
          in the comparison. Future seasons will add new elements like Fire, Earth, Frost and more.
        </p>

        {/* Element Wheel */}
        <div className={styles.elementWheelWrapper}>
          <div className={styles.elementWheelTitle}>Element Wheel</div>
          <div className={styles.elementWheel}>
            <div className={`${styles.elementNode} ${styles.light}`}>
              <span className={styles.elementEmoji}>☀️</span>
              <span className={styles.elementName}>Light</span>
            </div>
            <div className={styles.arrow}>▶</div>
            <div className={`${styles.elementNode} ${styles.dark}`}>
              <span className={styles.elementEmoji}>💀</span>
              <span className={styles.elementName}>Dark</span>
            </div>
            <div className={styles.arrow}>▶</div>
            <div className={`${styles.elementNode} ${styles.water}`}>
              <span className={styles.elementEmoji}>💧</span>
              <span className={styles.elementName}>Water</span>
            </div>
            <div className={styles.arrow}>▶</div>
            <div className={`${styles.elementNode} ${styles.electric}`}>
              <span className={styles.elementEmoji}>⚡</span>
              <span className={styles.elementName}>Electric</span>
            </div>
            <div className={styles.arrow}>▶</div>
            <div className={`${styles.elementNode} ${styles.plant}`}>
              <span className={styles.elementEmoji}>🍃</span>
              <span className={styles.elementName}>Plant</span>
            </div>
            <div className={styles.arrow}>▶</div>
          </div>
          <p className={styles.elementWheelHint}>
            Follow the wheel clockwise to see which element has advantage over the next.
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Match Flow (Best of 3)</h2>
        <ul>
          <li>A full MemeX match is played as a <strong>best of three</strong> series.</li>
          <li>Round 1: the starting player is chosen at random.</li>
          <li>The loser of each round starts the next round.</li>
          <li>
            The player who wins <strong>two out of three rounds</strong> wins the match and the Duelverse
            bragging rights.
          </li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2>Card Ownership as NFTs</h2>
        <p>
          Every MemeX card will exist as a real NFT. You can collect, trade and use your cards across
          future Duelverse modes, tournaments and special events. Rare and ultra-rare cards become
          true prestige pieces inside the community.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Enter the Duelverse</h2>
        <p>
          Join the MEMEX presale, secure your position as an early Duelverse player and prepare your
          starter deck for launch day.
        </p>
      </div>
    </section>
  );
}