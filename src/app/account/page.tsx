'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import WalletButton from '@/components/Wallet/WalletButton';
import styles from './page.module.css';

type Mode = 'login' | 'register';

export default function AccountPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'register' && password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setMessage('Account created. Redirecting to your dashboard ...');
          router.push('/account/private');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          router.push('/account/private');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchTo = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setMessage(null);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>MY ACCOUNT</h1>
        <p className={styles.subtitle}>
          CONNECT YOUR WALLET OR LOG IN WITH EMAIL TO SEE YOUR LOCKED MEMEX AND FUTURE NFTS.
        </p>

        {/* WALLET CONNECT */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>CONNECT WITH WALLET</h2>
          <p className={styles.sectionText}>
            CONNECT YOUR SOLANA WALLET TO LINK YOUR PRESALE PURCHASES TO THIS ACCOUNT. AFTER CONNECTING YOU&apos;LL
            BE REDIRECTED AUTOMATICALLY TO YOUR PRIVATE DASHBOARD.
          </p>
          <div className={styles.walletButtonWrapper}>
            <WalletButton />
          </div>
        </section>

        {/* EMAIL LOGIN / REGISTER */}
        <section className={styles.section}>
          <div className={styles.tabRow}>
            <button
              type="button"
              className={mode === 'login' ? styles.tabActive : styles.tab}
              onClick={() => switchTo('login')}
            >
              LOGIN
            </button>
            <button
              type="button"
              className={mode === 'register' ? styles.tabActive : styles.tab}
              onClick={() => switchTo('register')}
            >
              REGISTER
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              <span className={styles.labelText}>EMAIL</span>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                autoComplete="email"
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>PASSWORD</span>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'CHOOSE A PASSWORD' : 'ENTER YOUR PASSWORD'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </label>

            {mode === 'register' && (
              <label className={styles.label}>
                <span className={styles.labelText}>CONFIRM PASSWORD</span>
                <input
                  type="password"
                  className={styles.input}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="REPEAT YOUR PASSWORD"
                  autoComplete="new-password"
                />
              </label>
            )}

            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.message}>{message}</p>}

            <button className={styles.submit} type="submit" disabled={loading}>
              {loading
                ? mode === 'register'
                  ? 'CREATING ACCOUNT...'
                  : 'LOGGING IN...'
                : mode === 'register'
                ? 'CREATE MY ACCOUNT'
                : 'LOGIN TO MY ACCOUNT'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}