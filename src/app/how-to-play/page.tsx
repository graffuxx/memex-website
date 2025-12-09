// src/app/how-to-play/page.tsx
'use client';

import styles from './HowToPlay.module.css';

export default function HowToPlayPage() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.overlay} />

      <div className={styles.inner}>
        <h1 className={styles.title}>How to Play MemeX: Duelverse</h1>
        <p className={styles.subtitle}>
          A fast, strategic meme card game on a hex-grid battlefield. Place cards, flip your opponent&apos;s memes
          and control the board across three intense rounds.
        </p>

        {/* 1. Battlefield + Board Image */}
        <div className={styles.row}>
          <div className={styles.colText}>
            <h2>1. The Battlefield</h2>
            <p>
              Matches are played on the MemeX hex-grid board. Each position can hold exactly one card. Once
              all positions are filled, the round ends and both players count how many cards they control.
            </p>
            <p>
              Clever placement lets you set up combos, chains and last-second flips that turn the entire board.
            </p>
          </div>
          <div className={styles.colVisual}>
            <div className={styles.imageFrame}>
              <img
                src="/howtoplay-board.png"
                alt="MemeX hex board example"
                className={styles.image}
              />
            </div>
          </div>
        </div>

        {/* 2. Start & Turn Order + Flow Image */}
        <div className={styles.row}>
          <div className={styles.colVisual}>
            <div className={styles.imageFrame}>
              <img
                src="/howtoplay-turnflow.png"
                alt="Turn order and round flow"
                className={styles.image}
              />
            </div>
          </div>
          <div className={styles.colText}>
            <h2>2. Start of the Match</h2>
            <p>
              At the beginning of a match it is randomly decided who starts. Players then take turns placing one
              card at a time on any free position on the board.
            </p>
            <p>
              Every placement matters – you decide whether to apply pressure, defend key spots or set up a huge
              flip in the next turns.
            </p>
          </div>
        </div>

        {/* 3. Numbers & Flipping + Card Example Image */}
        <div className={styles.row}>
          <div className={styles.colText}>
            <h2>3. Numbers & Flipping Cards</h2>
            <p>
              Each MemeX card has a base number that represents its strength. When you place a card next to an
              opponent&apos;s card:
            </p>
            <ul>
              <li>If your number is higher, the adjacent opponent card is flipped and becomes yours.</li>
              <li>Element advantages can boost your effective strength and flip stronger enemy cards.</li>
            </ul>
            <p>
              With smart positioning, one well-timed placement can flip multiple cards in a chain.
            </p>
          </div>
          <div className={styles.colVisual}>
            <div className={styles.imageFrame}>
              <img
                src="/howtoplay-card-example.png"
                alt="Example MemeX card"
                className={styles.image}
              />
            </div>
          </div>
        </div>

        {/* 4. Elements + Element Wheel */}
        <div className={styles.section}>
          <h2>4. Element System</h2>
          <p>
            Every card belongs to one of five launch elements. Elements interact with clear strengths and
            weaknesses and can decide close duels:
          </p>

          <ul>
            <li><strong>Light (☀️)</strong> beats <strong>Dark (💀)</strong></li>
            <li><strong>Dark (💀)</strong> beats <strong>Water (💧)</strong></li>
            <li><strong>Water (💧)</strong> beats <strong>Electric (⚡)</strong></li>
            <li><strong>Electric (⚡)</strong> beats <strong>Plant (🍃)</strong></li>
            <li><strong>Plant (🍃)</strong> beats <strong>Light (☀️)</strong></li>
          </ul>

          <p>
            When your element has the advantage in this cycle, your card gains a small effective bonus in the
            comparison. Future seasons will add new elements like Fire, Earth, Frost and more.
          </p>

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

        {/* 5. Match Flow + Best-of-3 Image */}
        <div className={styles.row}>
          <div className={styles.colText}>
            <h2>5. Match Flow (Best of 3)</h2>
            <ul>
              <li>A full MemeX match is played as a best of three series.</li>
              <li>Round 1: the starting player is chosen at random.</li>
              <li>The loser of each round starts the next round.</li>
              <li>
                The player who wins two out of three rounds wins the match and the Duelverse bragging rights.
              </li>
            </ul>
          </div>
          <div className={styles.colVisual}>
            <div className={styles.imageFrame}>
              <img
                src="/howtoplay-roundflow.png"
                alt="Best of three round flow"
                className={styles.image}
              />
            </div>
          </div>
        </div>

        {/* 6. NFT Ownership */}
        <div className={styles.section}>
          <h2>6. Card Ownership as NFTs</h2>
          <p>
            Every MemeX card will exist as a real NFT. You can collect, trade and use your cards across future
            Duelverse modes, tournaments and special events. Rare and ultra-rare cards become true prestige
            pieces inside the community.
          </p>
        </div>

        <div className={styles.section}>
          <h2>Enter the Duelverse</h2>
          <p>
            Join the MEMEX presale, secure your position as an early Duelverse player and prepare your starter
            deck for launch day.
          </p>
        </div>
      </div>
    </section>
  );
}