'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import WalletButton from '@/components/Wallet/WalletButton';
import styles from './page.module.css';

type Mode = 'login' | 'register';

export default function AccountPage() {
  const { publicKey, connected } = useWallet();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState(''); // NEW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Wenn Wallet verbunden ist, automatisch in den privaten Bereich weiterleiten
  useEffect(() => {
    if (connected && publicKey) {
      // Optional: Wallet im localStorage merken
      try {
        localStorage.setItem('memex_connected_wallet', publicKey.toBase58());
      } catch {
        // Ignorieren – nur Komfort
      }
      window.location.href = '/account/private';
    }
  }, [connected, publicKey]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    // Nur beim Registrieren: Passwörter vergleichen
    if (mode === 'register') {
      if (!passwordConfirm) {
        setError('Please repeat your password.');
        return;
      }
      if (password !== passwordConfirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        // Erfolgreich eingeloggt → weiter in den privaten Account
        window.location.href = '/account/private';
      } else {
        // REGISTER
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          // z.B. "Email rate limit exceeded" o.ä.
          throw signUpError;
        }

        // Hinweis für Verifizierungs-Mail
        setInfo('Check your inbox to confirm your email. After verification you can log in.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg =
        err?.message ||
        'Something went wrong. Please try again in a moment.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
    setInfo(null);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>MY ACCOUNT</h1>
        <p className={styles.subtitle}>
          CONNECT YOUR WALLET OR LOG IN WITH EMAIL TO SEE YOUR LOCKED MEMEX AND FUTURE NFTS.
        </p>

        {/* WALLET CONNECT SECTION */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>CONNECT WITH WALLET</h2>
          <p className={styles.sectionText}>
            CONNECT YOUR SOLANA WALLET TO LINK YOUR PRESALE PURCHASES TO THIS ACCOUNT. AFTER
            CONNECTING YOU&apos;LL BE REDIRECTED AUTOMATICALLY TO YOUR PRIVATE DASHBOARD.
          </p>
          <div className={styles.walletButtonRow}>
            <WalletButton />
          </div>
        </section>

        {/* EMAIL LOGIN / REGISTER SECTION */}
        <section className={styles.section}>
          <div className={styles.tabsRow}>
            <button
              type="button"
              className={`${styles.tabButton} ${
                mode === 'login' ? styles.tabButtonActive : ''
              }`}
              onClick={() => switchMode('login')}
            >
              LOGIN
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${
                mode === 'register' ? styles.tabButtonActive : ''
              }`}
              onClick={() => switchMode('register')}
            >
              REGISTER
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* EMAIL */}
            <label className={styles.label}>
              EMAIL
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </label>

            {/* PASSWORD */}
            <label className={styles.label}>
              PASSWORD
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>

            {/* CONFIRM PASSWORD – nur im REGISTER-Modus */}
            {mode === 'register' && (
              <label className={styles.label}>
                CONFIRM PASSWORD
                <input
                  type="password"
                  className={styles.input}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </label>
            )}

            {/* Fehlermeldung */}
            {error && <p className={styles.errorText}>{error}</p>}

            {/* Info (z.B. E-Mail-Bestätigung) */}
            {info && <p className={styles.infoText}>{info}</p>}

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading
                ? mode === 'login'
                  ? 'LOGGING IN...'
                  : 'CREATING ACCOUNT...'
                : mode === 'login'
                ? 'LOGIN TO MY ACCOUNT'
                : 'CREATE MY ACCOUNT'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}