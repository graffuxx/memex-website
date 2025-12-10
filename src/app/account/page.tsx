'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '@/components/Wallet/WalletButton';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

export default function AccountPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Wenn Wallet verbunden -> automatisch in den privaten Bereich
  useEffect(() => {
    if (connected && publicKey) {
      router.push('/account/private');
    }
  }, [connected, publicKey, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          router.push('/account/private');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account/private`,
          },
        });
        if (error) {
          setError(error.message);
        } else {
          setMessage(
            'Check your inbox – we sent you a confirmation mail. After verifying you can log in to your account.'
          );
        }
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again later.');
      console.error('Supabase auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Video-Hintergrund */}
      <video
        className={styles.backgroundVideo}
        src="/memex-accountlogin.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.title}>MY ACCOUNT</h1>
          <p className={styles.subtitle}>
            Connect your wallet or log in with email to see your locked MEMEX and future NFTs.
          </p>

          {/* WALLET-BEREICH */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Connect with Wallet</h2>
            <p className={styles.sectionText}>
              Connect your Solana wallet to link your presale purchases to this account. After
              connecting you&apos;ll be redirected automatically to your private dashboard.
            </p>
            <div className={styles.walletRow}>
              <WalletButton />
            </div>
          </section>

          {/* EMAIL LOGIN / REGISTER */}
          <section className={styles.section}>
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tabButton} ${
                  mode === 'login' ? styles.tabButtonActive : ''
                }`}
                onClick={() => {
                  setMode('login');
                  setMessage(null);
                  setError(null);
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${
                  mode === 'register' ? styles.tabButtonActive : ''
                }`}
                onClick={() => {
                  setMode('register');
                  setMessage(null);
                  setError(null);
                }}
              >
                Register
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label}>
                Email
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>

              {error && <p className={styles.errorText}>{error}</p>}
              {message && <p className={styles.infoText}>{message}</p>}

              <button className={styles.submitButton} type="submit" disabled={loading}>
                {loading
                  ? 'Please wait…'
                  : mode === 'login'
                  ? 'Login to my account'
                  : 'Create my account'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}