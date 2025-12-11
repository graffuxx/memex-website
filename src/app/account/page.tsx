'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import WalletButton from '@/components/Wallet/WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './page.module.css';

export default function AccountPage() {
  const router = useRouter();

  // E-Mail Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Wallet State
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() ?? null;
  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : '';

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase signIn error:', error);
        setErrorMessage(error.message || 'Login failed. Please try again.');
        return;
      }

      router.push('/account/private');
    } catch (err) {
      console.error('Unexpected login error:', err);
      setErrorMessage('Unexpected error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletEnter = () => {
    // Kein E-Mail-Login nötig – wir nutzen nur die verbundene Wallet
    router.push('/account/private');
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Video-Hintergrund */}
      <video
        className={styles.backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/memex-accountlogin.mp4" type="video/mp4" />
      </video>
      <div className={styles.backgroundOverlay} />

      <div className={styles.center}>
        <div className={styles.card}>
          <h1 className={styles.title}>My Account</h1>
          <p className={styles.subtitle}>
            Connect your wallet or log in with email to see your locked MEMEX
            and future NFTs.
          </p>

          {/* WALLET SECTION */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Connect with Wallet</h2>
            <p className={styles.sectionText}>
              Connect your Solana wallet to link your presale purchases to this
              account. You can access your private dashboard with wallet only,
              no email required.
            </p>

            <div className={styles.walletButtonWrapper}>
              <WalletButton />
            </div>

            {/* Status + Dashboard-Button für Wallet */}
            {connected && walletAddress ? (
              <>
                <p className={styles.helperText} style={{ marginTop: '8px' }}>
                  Wallet connected: <strong>{shortWallet}</strong>
                </p>
                <button
                  type="button"
                  className={styles.submitButton}
                  style={{ marginTop: '8px' }}
                  onClick={handleWalletEnter}
                >
                  Enter wallet dashboard
                </button>
              </>
            ) : (
              <p className={styles.helperText} style={{ marginTop: '8px' }}>
                Use the <strong>Select Wallet</strong> button here to connect.
                Once connected, you can enter your dashboard with wallet only.
              </p>
            )}
          </section>

          {/* LOGIN / REGISTER TABS */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabButton} ${styles.tabActive}`}
            >
              Login
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${styles.tabInactive}`}
              onClick={() => router.push('/account/register')}
            >
              Register
            </button>
          </div>

          {/* LOGIN FORM */}
          <form className={styles.form} onSubmit={handleLogin}>
            <label className={styles.label}>
              Email
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </label>

            <label className={styles.label}>
              Password
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Logging you in…' : 'Login to my account'}
            </button>
          </form>

          <p className={styles.helperText}>
            First time here?{' '}
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => router.push('/account/register')}
            >
              Create your account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}