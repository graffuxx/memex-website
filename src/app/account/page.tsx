'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import WalletButton from '@/components/Wallet/WalletButton';
import styles from './page.module.css';

export default function AccountPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Wenn Wallet schon verbunden ist -> direkt in den privaten Bereich
  useEffect(() => {
    if (connected && publicKey) {
      router.push('/account/private');
    }
  }, [connected, publicKey, router]);

  // Wenn bereits per Mail eingeloggt -> auch direkt weiterleiten
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push('/account/private');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (error) throw error;
        setInfo('Check your inbox to confirm your email address.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/account/private');
      }
    } catch (err: any) {
      setError(err.message ?? 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.accountWrapper}>
      {/* Hintergrundvideo etc. kann in page.module.css kommen – Hauptsache, die Logik steht */}
      <div className={styles.overlay} />

      <div className={styles.box}>
        <h1 className={styles.title}>MY ACCOUNT</h1>

        <div className={styles.columns}>
          {/* WALLET-LOGIN */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Connect with Wallet</h2>
            <p className={styles.cardText}>
              Connect your Solana wallet to see your locked MEMEX and future
              NFTs.
            </p>
            <div className={styles.walletButtonArea}>
              <WalletButton />
            </div>
            <p className={styles.cardHint}>
              After connecting you’ll be redirected automatically to your
              private account.
            </p>
          </div>

          {/* E-MAIL LOGIN / REGISTER */}
          <div className={styles.card}>
            <div className={styles.tabRow}>
              <button
                type="button"
                className={`${styles.tabButton} ${
                  mode === 'login' ? styles.tabActive : ''
                }`}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${
                  mode === 'register' ? styles.tabActive : ''
                }`}
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label}>
                Email
                <input
                  className={styles.input}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className={styles.label}>
                Password
                <input
                  className={styles.input}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {error && <p className={styles.error}>{error}</p>}
              {info && <p className={styles.info}>{info}</p>}

              <button
                className={styles.submit}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Login'
                  : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}