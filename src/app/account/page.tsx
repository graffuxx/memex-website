// src/app/account/page.tsx
'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import WalletButton from '@/components/Wallet/WalletButton';
import styles from './page.module.css';

export default function AccountPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Wenn Wallet verbunden -> Private Account
  useEffect(() => {
    if (connected && publicKey) {
      const addr = publicKey.toBase58();
      if (typeof window !== 'undefined') {
        localStorage.setItem('memex_last_wallet', addr);
      }
      router.push('/account/private');
    }
  }, [connected, publicKey, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
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

  return (
    <div className={styles.pageWrapper}>
      {/* Video-Background */}
      <video
        className={styles.backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/memex-accountlogin.mp4" type="video/mp4" />
      </video>
      <div className={styles.backdropOverlay} />

      <div className={styles.centerWrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>MY ACCOUNT</h1>
          <p className={styles.subtitle}>
            Connect your wallet or log in with email to see your locked MEMEX
            and future NFTs.
          </p>

          {/* WALLET SECTION */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>CONNECT WITH WALLET</h2>
            <p className={styles.sectionText}>
              Connect your Solana wallet to link your presale purchases to this
              account. After connecting you&apos;ll be redirected automatically
              to your private dashboard.
            </p>

            <div className={styles.walletButtonWrapper}>
              <WalletButton />
            </div>
          </section>

          <div className={styles.sectionDivider} />

          {/* LOGIN TABS */}
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
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              Email
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
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
                autoComplete="current-password"
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
              {isLoading ? 'Logging in…' : 'Login to my account'}
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