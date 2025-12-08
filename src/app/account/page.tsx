'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

export default function AccountLoginPage() {
  const router = useRouter();
  const { setVisible } = useWalletModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('memexUser');
    if (stored) setIsLoggedIn(true);
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    if (data.user) {
      localStorage.setItem('memexUser', JSON.stringify({ email }));
      router.push('/account/private');
    } else {
      setError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('memexUser');
    setIsLoggedIn(false);
    router.refresh();
  };

  return (
    <section className={styles.accountLoginPage}>
      {/* Hintergrundvideo */}
      <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
        <source src="/memex-accountlogin.mp4" type="video/mp4" />
      </video>

      {/* Logout oben rechts */}
      {isLoggedIn && (
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      )}

      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Connect Wallet or Login</h2>

        <button className={styles.loginButton} onClick={() => setVisible(true)}>
          Select Wallet
        </button>

        <div className={styles.or}>OR</div>

        <button className={styles.loginButton} onClick={() => setShowLoginForm(true)}>
          Login via Email
        </button>

        {showLoginForm && (
          <form onSubmit={handleEmailLogin} className={styles.loginForm}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
              required
            />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.emailInput}
              required
            />
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
            {error && <p className={styles.errorText}>{error}</p>}
            <div className={styles.registerText}>
              <a href="/account/reset">Forgot your password?</a>
            </div>
          </form>
        )}

        <div className={styles.or}>OR</div>
        <div className={styles.registerText}>
          No account? <a href="/account/register">Register here</a>
        </div>
      </div>
    </section>
  );
}