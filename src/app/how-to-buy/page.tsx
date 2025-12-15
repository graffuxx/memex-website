'use client';

import styles from './page.module.css';

const steps = [
  {
    num: '01',
    title: 'Install Phantom Wallet',
    text: 'Download Phantom for your browser or phone. Create a new wallet and securely save your Secret Recovery Phrase.',
    tip: 'Never share your seed phrase. Ever.',
  },
  {
    num: '02',
    title: 'Get SOL (Solana)',
    text: 'Buy SOL on an exchange (Coinbase, Binance, Kraken, etc.) or swap inside Phantom. You need SOL to participate in the presale.',
    tip: 'Keep a little extra SOL for network fees.',
  },
  {
    num: '03',
    title: 'Send SOL to Phantom',
    text: 'Withdraw SOL from the exchange to your Phantom SOL address. Double-check the address and use the Solana network.',
    tip: 'Send a small test amount first if you’re unsure.',
  },
  {
    num: '04',
    title: 'Connect Wallet on MemeX',
    text: 'Go to our Presale page and click “Select Wallet”. Choose Phantom (or your Solana wallet) and approve the connection.',
    tip: 'You stay in control. We never see your private keys.',
  },
  {
    num: '05',
    title: 'Buy MEMEX in Presale',
    text: 'Enter your SOL amount, confirm the transaction in your wallet, and you’re in. Your purchase will be recorded for claiming later.',
    tip: 'MEMEX will be claimable after the presale ends (locked until then).',
  },
  {
    num: '06',
    title: 'Claim Later (after Presale)',
    text: 'When the presale ends, you’ll be able to claim your MEMEX in your Account area. Stay tuned in our News/Channels.',
    tip: 'Early supporters may get special NFT rewards.',
  },
];

export default function HowToBuyPage() {
  return (
    <section className={styles.page}>
      {/* Background */}
      <video autoPlay muted loop playsInline className={styles.bgVideo}>
        <source src="/comingsoon-background.mp4" type="video/mp4" />
      </video>
      <div className={styles.bgOverlay} />

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.headerBlock}>
          <h1 className={styles.title}>HOW TO BUY</h1>
          <p className={styles.subtitle}>
            Welcome, Duelist. Complete this quest to join the MEMEX Presale.
          </p>
        </div>

        <div className={styles.quest}>
          {steps.map((s, idx) => (
            <div key={s.num} className={styles.stepRow}>
              <div className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNum}>{s.num}</span>
                  <span className={styles.stepBadge}>Quest Step</span>
                </div>

                <h2 className={styles.stepTitle}>{s.title}</h2>
                <p className={styles.stepText}>{s.text}</p>

                <div className={styles.tip}>
                  <span className={styles.tipLabel}>Tip</span>
                  <span className={styles.tipText}>{s.tip}</span>
                </div>
              </div>

              {idx !== steps.length - 1 && (
                <div className={styles.arrowWrap} aria-hidden="true">
                  <div className={styles.arrowLine} />
                  <div className={styles.arrowHead} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.ctaRow}>
          <a className={styles.ctaPrimary} href="/presale">
            Go to Presale
          </a>
          <a className={styles.ctaGhost} href="/account">
            Open Account
          </a>
        </div>

        <p className={styles.disclaimer}>
          This is a simple guide. Always double-check addresses and only use the Solana network when sending SOL.
        </p>
      </div>
    </section>
  );
}