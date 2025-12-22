'use client';

import { useEffect, useState } from 'react';
import styles from './PresaleOverview.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import { supabase } from '@/lib/supabaseClient';
import WalletButton from '@/components/Wallet/WalletButton';
import PayPalSupportCheckout from '@/components/PayPalSupportCheckout';

// Presale LOCK until 03.01.2026, 18:00 New York (EST) => 23:00 UTC
const PRESALE_START_UTC = new Date('2026-01-03T23:00:00.000Z');

// Treasury-Wallet für eingehende SOL
const treasuryWallet = new PublicKey(
  '42MZFG1imQ9eE6z3YNgC8LgeFVH3u8csppbnRNDAdtYw'
);

const levels = [
  { level: 1, rate: 1800000, durationDays: 14 },
  { level: 2, rate: 1600000, durationDays: 14 },
  { level: 3, rate: 1400000, durationDays: 14 },
  { level: 4, rate: 1200000, durationDays: 14 },
  { level: 5, rate: 1000000, durationDays: 14 },
  { level: 6, rate: 800000, durationDays: 14 },
  { level: 7, rate: 600000, durationDays: 14 },
  { level: 8, rate: 400000, durationDays: 14 },
  { level: 9, rate: 200000, durationDays: 14 },
  { level: 10, rate: 100000, durationDays: 14 },
];

export default function PresaleOverview() {
  const [activeLevelIndex, setActiveLevelIndex] = useState(0);

  // Presale lock countdown
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const isPresaleStarted = now.getTime() >= PRESALE_START_UTC.getTime();
  const diff = Math.max(0, PRESALE_START_UTC.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const [solAmount, setSolAmount] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [solPrice, setSolPrice] = useState<number | null>(null); // Live SOL/EUR Preis

  const { publicKey, sendTransaction, connected } = useWallet();
  const connection = new Connection(
    process.env.NEXT_PUBLIC_HELIUS_RPC_URL ||
      'https://api.mainnet-beta.solana.com'
  );

  const currentLevel = levels[activeLevelIndex];
  const nextLevel = levels[activeLevelIndex + 1];

  // TODO: später dynamisch aus DB
  const currentProgress = 0;

  const solAmountNumber = Number(solAmount) || 0;
  const memexAmount = solAmountNumber * currentLevel.rate;

  // Basis-EUR-Wert (ohne Gebühr), wenn Preis noch nicht da: 0
  const eurAmount = solPrice ? solAmountNumber * solPrice : 0;

  // --- SOL-PREIS laden (Serverroute /api/price/sol) ---
  useEffect(() => {
    async function loadPrice() {
      try {
        const res = await fetch('/api/price/sol');
        const data = await res.json();
        if (data && typeof data.eur === 'number') {
          setSolPrice(data.eur);
        } else {
          setSolPrice(110); // Fallback
        }
      } catch (err) {
        console.error('Error loading SOL price:', err);
        setSolPrice(110); // Fallback
      }
    }
    loadPrice();
  }, []);

  const handleWalletBuy = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      setIsProcessing(true);

      const lamports = solAmountNumber * LAMPORTS_PER_SOL;
      if (!lamports || lamports <= 0) return;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryWallet,
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      const { error } = await supabase.from('presale_orders').insert([
        {
          wallet: publicKey.toBase58(),
          sol_amount: solAmountNumber,
          memex_amount: memexAmount,
          level: currentLevel.level,
          tx_hash: signature,
          payment_method: 'solana_wallet',
          payment_provider: null,
        },
      ]);

      if (error) {
        console.error('Supabase insert error:', error);
        alert(
          'Purchase succeeded on-chain, but database entry failed. Please contact support with your TX hash.'
        );
      } else {
        setTxHash(signature);
        setIsSuccess(true);
        setSolAmount('1');
      }
    } catch (err) {
      console.error('Transaction failed:', err);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const shortWallet =
    publicKey &&
    `${publicKey.toBase58().slice(0, 4)}...${publicKey
      .toBase58()
      .slice(-4)}`;

  return (
    <section className={styles.presaleSection}>
      <div className={styles.fadeTopOverlay}></div>
      <div className={styles.videoWrapper}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.videoBackground}
        >
          <source src="/memex-presale.mp4" type="video/mp4" />
        </video>
        <div className={styles.fadeBottom}></div>
      </div>

      <div className={styles.box}>
        <h2 className={styles.title}>Presale Overview</h2>

        {!isPresaleStarted ? (
          <div className={styles.presaleLockedBox}>
            <h3 className={styles.presaleLockedTitle}>PRESALE LOCKED</h3>
            <p className={styles.presaleLockedText}>Starts in</p>

            <div className={styles.countdownRow}>
              <div className={styles.countdownItem}>
                <span>{days}</span>
                <small>D</small>
              </div>
              <div className={styles.countdownItem}>
                <span>{hours}</span>
                <small>H</small>
              </div>
              <div className={styles.countdownItem}>
                <span>{minutes}</span>
                <small>M</small>
              </div>
              <div className={styles.countdownItem}>
                <span>{seconds}</span>
                <small>S</small>
              </div>
            </div>

            <p className={styles.presaleLockedSub}>
              Unlock: Dec 27, 2025 — 6:00 PM New York / 11:00 PM UTC / 12:00 AM
              Berlin
            </p>
          </div>
        ) : (
          <>
            {/* LEVEL STACK */}
            <div className={styles.levelStack}>
              <div className={styles.levelCardCurrent}>
                <div className={styles.levelHeaderRow}>
                  <div>
                    <p className={styles.levelLabel}>Current Level</p>
                    <p className={styles.levelNumber}>
                      Level {currentLevel.level}
                      <span className={styles.levelTotal}> / 10</span>
                    </p>
                  </div>

                  <div className={styles.levelRateBlock}>
                    <p className={styles.levelRateLabel}>Rate</p>
                    <p className={styles.levelRateValue}>
                      1 SOL = {currentLevel.rate.toLocaleString()} MEMEX
                    </p>
                  </div>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${currentProgress}%` }}
                  ></div>
                </div>
                <div className={styles.levelMetaRow}>
                  <p className={styles.percent}>{currentProgress}% Sold</p>
                  <p className={styles.levelDuration}>
                    Max. {currentLevel.durationDays} days or until sold out
                  </p>
                </div>
                <p className={styles.nftTeaser}>
                  🔥 Random NFT drops in this level!
                </p>
              </div>

              {nextLevel && (
                <div className={styles.levelCardNext}>
                  <p className={styles.levelLabel}>Next Level</p>
                  <p className={styles.levelNumberNext}>
                    Level {nextLevel.level} / 10
                  </p>
                  <p className={styles.levelRateNext}>
                    1 SOL = {nextLevel.rate.toLocaleString()} MEMEX
                  </p>
                  <p className={styles.levelHint}>
                    Starts after full sell-out or in {nextLevel.durationDays} days.
                  </p>
                </div>
              )}
            </div>

            {/* BUY AREA */}
            <div className={styles.buyBox}>
              <div className={styles.amountRow}>
                <div className={styles.amountLeft}>
                  <label className={styles.amountLabel}>
                    SOL Amount
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={solAmount}
                      onChange={(e) => setSolAmount(e.target.value)}
                      className={styles.solInput}
                    />
                  </label>
                </div>
                <div className={styles.amountRight}>
                  <p>
                    ≈ EUR{' '}
                    <span>
                      {solPrice ? `${eurAmount.toFixed(2)} €` : 'Loading…'}
                    </span>
                  </p>
                  <p>
                    You get&nbsp;<span>{memexAmount.toLocaleString()} MEMEX</span>
                  </p>
                </div>
              </div>

              <div className={styles.paymentGrid}>
                {/* WALLET */}
                <div className={styles.walletBox}>
                  <p className={styles.blockTitle}>Pay with your Solana wallet</p>
                  {!connected ? (
                    <>
                      <div className={styles.walletConnectWrapper}>
                        <WalletButton />
                      </div>
                      <p className={styles.helperText}>
                        Connect your wallet first, then confirm the transaction to
                        lock your MEMEX.
                      </p>
                    </>
                  ) : (
                    <>
                      <button
                        className={styles.buyButton}
                        onClick={handleWalletBuy}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing…' : 'Buy MEMEX with Wallet'}
                      </button>
                      <p className={styles.walletInfo}>
                        Connected: <span>{shortWallet}</span>
                      </p>
                      <p className={styles.helperText}>
                        Your SOL is sent securely to the MemeX treasury. MEMEX
                        tokens are <strong>locked</strong> during the presale and
                        will be <strong>claimable after the presale ends</strong>.
                      </p>
                    </>
                  )}
                </div>

                {/* PAYPAL */}
                <div className={styles.cardBox}>
                  <PayPalSupportCheckout
                    walletAddress={publicKey?.toBase58() || null}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {isSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successBox}>
            <h3 className={styles.successTitle}>🎉 Purchase Successful!</h3>
            <p>You’ve secured your MEMEX tokens for this presale level.</p>
            <p className={styles.txInfo}>
              Your tokens are locked until the end of the presale.
            </p>
            {txHash && (
              <p className={styles.txHash}>
                TX:{' '}
                <a
                  href={`https://solscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txHash.slice(0, 20)}...
                </a>
              </p>
            )}
            <button
              className={styles.closeSuccess}
              onClick={() => setIsSuccess(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}