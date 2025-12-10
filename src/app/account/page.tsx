'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { supabase } from '@/lib/supabaseClient';
import WalletButton from '@/components/Wallet/WalletButton';

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

  const switchMode = (next: Mode) => {
    setMode(next);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter email and password.');
        return;
      }

      if (mode === 'register') {
        if (!passwordConfirm) {
          setError('Please confirm your password.');
          return;
        }
        if (password !== passwordConfirm) {
          setError('Passwords do not match.');
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message || 'Could not create account.');
        } else {
          setMessage(
            'Account created. Please check your email inbox to confirm your address.'
          );
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || 'Could not log in.');
        } else {
          router.push('/account/private');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>MY ACCOUNT</h1>
        <p className={styles.subtitle}>
          Connect your wallet or log in with email to see your locked MEMEX and
          future NFTs.
        </p>

        {/* WALLET CONNECT SECTION */}
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

        {/* EMAIL LOGIN / REGISTER */}
        <section className={styles.section}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${
                mode === 'login' ? styles.tabActive : ''
              }`}
              onClick={() => switchMode('login')}
            >
              LOGIN
            </button>
            <button
              type="button"
              className={`${styles.tab} ${
                mode === 'register' ? styles.tabActive : ''
              }`}
              onClick={() => switchMode('register')}
            >
              REGISTER
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>EMAIL</span>
              <input
                type="email"
                className={styles.input}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>PASSWORD</span>
              <input
                type="password"
                className={styles.input}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </label>

            {mode === 'register' && (
              <label className={styles.field}>
                <span className={styles.label}>CONFIRM PASSWORD</span>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Repeat your password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
            )}

            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.message}>{message}</p>}

            <button
              type="submit"
              className={styles.submit}
              disabled={loading}
            >
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