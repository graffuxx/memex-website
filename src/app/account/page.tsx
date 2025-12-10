// src/app/account/page.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import WalletButton from '@/components/Wallet/WalletButton';
import styles from './page.module.css';

type ActiveTab = 'login' | 'register';

export default function AccountPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
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

    setLoading(true);
    try {
      if (activeTab === 'login') {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Supabase login error:', error);
          setErrorMsg(error.message || 'Login failed.');
          return;
        }

        if (data.session) {
          // erfolgreich eingeloggt → Weiterleitung in privaten Bereich
          router.push('/account/private');
        } else {
          setErrorMsg('Login failed. Please try again.');
        }
      } else {
        // REGISTER
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error('Supabase signup error:', error);
          setErrorMsg(error.message || 'Registration failed.');
          return;
        }

        console.log('Supabase signup result:', data);

        // Hinweistext – funktioniert mit oder ohne E-Mail-Bestätigung
        setSuccessMsg(
          'Account created. If email confirmation is enabled, please check your inbox. Otherwise you can now log in with your password.'
        );

        // Felder zurücksetzen / auf Login wechseln
        setPassword('');
        setPasswordConfirm('');
        setActiveTab('login');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        {/* Titelbereich */}
        <h1 className={styles.title}>MY ACCOUNT</h1>
        <p className={styles.subtitle}>
          CONNECT YOUR WALLET OR LOG IN WITH EMAIL TO SEE YOUR LOCKED MEMEX AND FUTURE NFTs.
        </p>

        {/* Wallet-Connect-Block */}
        <section className={styles.walletSection}>
          <h2 className={styles.sectionTitle}>CONNECT WITH WALLET</h2>
          <p className={styles.sectionText}>
            CONNECT YOUR SOLANA WALLET TO LINK YOUR PRESALE PURCHASES TO THIS ACCOUNT. AFTER CONNECTING YOU&apos;LL BE
            REDIRECTED AUTOMATICALLY TO YOUR PRIVATE DASHBOARD.
          </p>
          <div className={styles.walletButtonWrapper}>
            <WalletButton />
          </div>
        </section>

        {/* Tabs für Login / Register */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'login' ? styles.tabButtonActive : ''}`}
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            LOGIN
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'register' ? styles.tabButtonActive : ''}`}
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            REGISTER
          </button>
        </div>

        {/* Formular */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="ENTER YOUR EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder={activeTab === 'login' ? 'ENTER YOUR PASSWORD' : 'CHOOSE A PASSWORD'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {activeTab === 'register' && (
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="passwordConfirm">
                CONFIRM PASSWORD
              </label>
              <input
                id="passwordConfirm"
                type="password"
                className={styles.input}
                placeholder="REPEAT YOUR PASSWORD"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Fehlermeldung / Success */}
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          {successMsg && <p className={styles.success}>{successMsg}</p>}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading
              ? activeTab === 'login'
                ? 'LOGGING IN...'
                : 'CREATING ACCOUNT...'
              : activeTab === 'login'
              ? 'LOGIN TO MY ACCOUNT'
              : 'CREATE MY ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}