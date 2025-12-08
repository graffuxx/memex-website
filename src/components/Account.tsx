'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './Account.module.css';

export default function AccountSection() {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (publicKey) {
      localStorage.setItem('memexUser', JSON.stringify({ wallet: publicKey.toBase58() }));
      setIsLoggedIn(true);
      router.push('/account/private');
    }
  }, [publicKey]);

  const handleEmailLogin = async () => {
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      localStorage.setItem('memexUser', JSON.stringify({ email }));
      setIsLoggedIn(true);
      router.push('/account/private');
    }
  };

  return (
    <section className={styles.accountLoginPage}>
      <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
        <source src="/memex-accountlogin.mp4" type="video/mp4" />
      </video>

      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Your Duelverse Account</h2>

        {!isLoggedIn && (
          <>
            <button className={styles.loginButton} onClick={() => setVisible(true)}>
              Connect Wallet
            </button>

            <div className={styles.or}>OR</div>

            <div className={styles.loginForm}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={handleEmailLogin}>Login via Email</button>
              {error && <p className={styles.error}>{error}</p>}
            </div>

            <div className={styles.or}>OR</div>

            <div className={styles.registerText}>
              No account? <a href="/account/register">Register here</a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}