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



const presaleStart = new Date('2025-12-21T01:00:00Z');
const treasuryWallet = new PublicKey(
  '42MZFG1imQ9eE6z3YNgC8LgeFVH3u8csppbnRNDAdtYw'
);

// Kreditkartenaufschlag (z.B. 2 % Gebühr)
const CARD_FEE_MULTIPLIER = 1.02;

// ⚠️ Admin-Override: solange TRUE, ist der Presale immer aktiv
const ADMIN_FORCE_PRESALE = true;

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
  const [countdown, setCountdown] = useState('');
  const [activeLevelIndex, setActiveLevelIndex] = useState(0);
  const [isPresaleStarted, setIsPresaleStarted] = useState(false);

  const [solAmount, setSolAmount] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardProcessing, setIsCardProcessing] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);

  const [solPrice, setSolPrice] = useState<number | null>(null); // Live SOL/EUR Preis

  // NEU: Wallet-Feedback
  const [walletMessage, setWalletMessage] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  const { publicKey, sendTransaction, connected } = useWallet();
 // RPC Endpoint priorisieren: Helius → fallback auf Solana clusterApiUrl
const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  'https://api.mainnet-beta.solana.com';

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

  const currentLevel = levels[activeLevelIndex];
  const nextLevel = levels[activeLevelIndex + 1];
  const currentProgress = 0; // TODO: später dynamisch aus DB

  const solAmountNumber = Number(solAmount) || 0;
  const memexAmount = solAmountNumber * currentLevel.rate;

  // Basis-EUR-Wert (ohne Gebühr), wenn Preis noch nicht da: 0
  const eurAmount = solPrice ? solAmountNumber * solPrice : 0;

  // EUR-Betrag inkl. 2 % Kreditkartenaufschlag
  const cardEurAmount = eurAmount * CARD_FEE_MULTIPLIER;

  // --- SOL-PREIS von CoinGecko laden ---
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

// --- PRESALE TIMER / LEVEL LOGIK ---
useEffect(() => {
  // Admin-Override: Presale immer aktiv, kein Countdown
  if (ADMIN_FORCE_PRESALE) {
    setIsPresaleStarted(true);
    setActiveLevelIndex(0); // Level 1
    setCountdown('');
    return;
  }

  const interval = setInterval(() => {
    const now = new Date();

    if (now >= presaleStart) {
      setIsPresaleStarted(true);
      const diffTime = Math.floor(
        (now.getTime() - presaleStart.getTime()) / 1000
      );
      const levelDuration = 60 * 60 * 24 * 14;
      const currentIndex = Math.min(
        Math.floor(diffTime / levelDuration),
        levels.length - 1
      );
      setActiveLevelIndex(currentIndex);
    } else {
      const diff = presaleStart.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);

  const handleWalletBuy = async () => {
    // Feedback zurücksetzen
    setWalletMessage(null);
    setWalletError(null);

    if (!connected || !publicKey) {
      console.log('[Presale] Wallet NOT connected');
      setWalletError('Wallet is not connected. Please connect your wallet first.');
      return;
    }

    if (!solAmountNumber || solAmountNumber <= 0) {
      setWalletError('Please enter a valid SOL amount.');
      return;
    }

    try {
      setIsProcessing(true);

      const lamports = solAmountNumber * LAMPORTS_PER_SOL;
      if (!lamports || lamports <= 0) {
        setWalletError('Invalid amount. Please check your SOL input.');
        return;
      }

      console.log(
        '[Presale] Sending transaction:',
        solAmountNumber,
        'SOL from',
        publicKey.toBase58(),
        'to',
        treasuryWallet.toBase58()
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryWallet,
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      console.log('[Presale] tx signature:', signature);

      await connection.confirmTransaction(signature, 'confirmed');
      console.log('[Presale] tx confirmed on-chain');

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
        setWalletError(
          'Purchase succeeded on-chain, but database entry failed. Please contact support with your TX hash.'
        );
      } else {
        setTxHash(signature);
        setIsSuccess(true);
        setSolAmount('1');
        setWalletMessage('BUY SUCCESS – your MEMEX is locked for this level.');
      }
    } catch (err: any) {
      console.error('Transaction failed:', err);

      const message =
        typeof err?.message === 'string' ? err.message.toLowerCase() : '';

      if (message.includes('rejected') || message.includes('user rejected')) {
        setWalletError(
          'Transaction was rejected in your wallet. Please approve the transaction to complete your MEMEX purchase.'
        );
      } else if (message.includes('insufficient funds')) {
        setWalletError(
          'Not enough SOL in your wallet to cover amount + fees. Please top up and try again.'
        );
      } else {
        setWalletError('Transaction failed. Please try again in a moment.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreditCardBuy = async () => {
    setCardError(null);

    if (!connected || !publicKey) {
      setCardError(
        'Please connect your wallet first so we can assign your MEMEX.'
      );
      return;
    }

    if (!solAmountNumber || solAmountNumber <= 0) {
      setCardError('Please enter a valid SOL amount.');
      return;
    }

    if (!solPrice) {
      setCardError('Price is still loading. Please wait a moment and try again.');
      return;
    }

    try {
      setIsCardProcessing(true);

      const res = await fetch('/api/nowpayments/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          level: currentLevel.level,
          memexAmount,
          solAmount: solAmountNumber,
          // Für Kreditkarte benutzen wir den Betrag MIT 2 % Gebühr
          eurAmount: cardEurAmount,
          baseEurAmount: eurAmount,
          email: email || null,
          paymentMethod: 'credit_card',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('NOWPayments create-invoice error:', data);
        setCardError('Payment initialization failed. Please try again.');
        return;
      }

      const data = await res.json();
      if (!data.invoiceUrl) {
        setCardError('No payment link returned from payment gateway.');
        return;
      }

      window.location.href = data.invoiceUrl as string;
    } catch (err) {
      console.error(err);
      setCardError('Unexpected error. Please try again.');
    } finally {
      setIsCardProcessing(false);
    }
  };

  const shortWallet =
    publicKey &&
    `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;

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
          <div className={styles.countdownBox}>
            <p>Presale starts in:</p>
            <p className={styles.timer}>{countdown}</p>
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
                    <p className={styles.levelSubLabel}>
                      Phase {currentLevel.level} of 10
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
                    Starts after full sell-out or in {nextLevel.durationDays}{' '}
                    days.
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
                    You get&nbsp;
                    <span>{memexAmount.toLocaleString()} MEMEX</span>
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
                    </>
                  )}

                  {/* NEU: Wallet-Feedback direkt unter dem Button */}
                  {walletMessage && (
                    <p className={styles.walletSuccess}>{walletMessage}</p>
                  )}
                  {walletError && (
                    <p className={styles.errorText}>{walletError}</p>
                  )}
                </div>

                {/* CREDIT CARD */}
                <div className={styles.cardBox}>
                  <p className={styles.blockTitle}>Or pay easily by credit card</p>
                  <input
                    type="email"
                    placeholder="Email (optional, for confirmations)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.emailInput}
                  />

                  <p className={styles.helperText}>
                    Credit card total:{' '}
                    <strong>
                      {solPrice ? `${cardEurAmount.toFixed(2)} €` : 'Loading…'}
                    </strong>{' '}
                    (incl. 2% fee)
                  </p>

                  <button
                    className={styles.cardButton}
                    onClick={handleCreditCardBuy}
                    disabled={isCardProcessing || !solPrice}
                  >
                    {isCardProcessing ? 'Redirecting…' : 'Continue with Credit Card'}
                  </button>
                  {cardError && (
                    <p className={styles.errorText}>{cardError}</p>
                  )}
                  <p className={styles.helperText}>
                    Payments are processed securely via NOWPayments. Your MEMEX
                    allocation will always be linked to your wallet.
                  </p>
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