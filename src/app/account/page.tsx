'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

type Tab = 'login' | 'register';

export default function AccountPage() {
  const router = useRouter();

  // Wallet
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  // Tabs & Form
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Wenn Wallet verbunden -> in privaten Bereich
  useEffect(() => {
    if (connected && publicKey) {
      router.push('/account/private');
    }
  }, [connected, publicKey, router]);

  // Wallet-Modal öffnen
  const handleSelectWallet = () => {
    setVisible(true);
  };

  // Login / Register Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    if (activeTab === 'register') {
      if (!passwordConfirm) {
        setErrorMsg('Please confirm your password.');
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    try {
      setLoading(true);

      if (activeTab === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error('Supabase signUp error:', error);
          setErrorMsg(error.message || 'Could not create account.');
          return;
        }

        setInfoMsg('Account created. You can now log in with your password.');
        setActiveTab('login');
        setPassword('');
        setPasswordConfirm('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Supabase signIn error:', error);
          setErrorMsg(error.message || 'Login failed.');
          return;
        }

        router.push('/account/private');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err?.message || 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>MY ACCOUNT</h1>
        <p className={styles.subtitle}>
          CONNECT YOUR WALLET OR LOG IN WITH EMAIL TO SEE YOUR LOCKED MEMEX AND FUTURE NFTS.
        </p>

        {/* Wallet Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>CONNECT WITH WALLET</h2>
          <p className={styles.sectionText}>
            CONNECT YOUR SOLANA WALLET TO LINK YOUR PRESALE PURCHASES TO THIS ACCOUNT. AFTER
            CONNECTING YOU&apos;LL BE REDIRECTED AUTOMATICALLY TO YOUR PRIVATE DASHBOARD.
          </p>

          <div className={styles.walletButtonRow}>
            <button
              type="button"
              className={styles.walletButton}
              onClick={handleSelectWallet}
            >
              SELECT WALLET
            </button>
          </div>
        </section>

        {/* Email Login / Register */}
        <section className={styles.section}>
          <div className={styles.tabRow}>
            <button
              type="button"
              className={activeTab === 'login' ? styles.tabActive : styles.tab}
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
            >
              LOGIN
            </button>
            <button
              type="button"
              className={activeTab === 'register' ? styles.tabActive : styles.tab}
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
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
                placeholder="ENTER YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>PASSWORD</span>
              <input
                type="password"
                className={styles.input}
                placeholder="ENTER YOUR PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
              />
            </label>

            {activeTab === 'register' && (
              <label className={styles.label}>
                <span className={styles.labelText}>CONFIRM PASSWORD</span>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="REPEAT YOUR PASSWORD"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
            )}

            {errorMsg && <p className={styles.error}>{errorMsg}</p>}
            {infoMsg && <p className={styles.message}>{infoMsg}</p>}

            <button
              type="submit"
              className={styles.submit}
              disabled={loading}
            >
              {activeTab === 'login'
                ? loading
                  ? 'LOGGING IN...'
                  : 'LOGIN TO MY ACCOUNT'
                : loading
                  ? 'CREATING ACCOUNT...'
                  : 'CREATE MY ACCOUNT'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}