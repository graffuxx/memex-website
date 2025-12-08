'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from '../page.module.css';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/account/update', // ⬅️ hier deine echte URL eintragen
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your inbox for a reset link!');
    }
  };

  return (
    <section className={styles.accountLoginPage}>
      <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
        <source src="/memex-accountlogin.mp4" type="video/mp4" />
      </video>

      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Reset Password</h2>
        <form onSubmit={handleReset} className={styles.loginForm}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.emailInput}
            required
          />
          <button type="submit" className={styles.loginButton}>Send Reset Email</button>
        </form>
        {message && <p style={{ color: 'lightgreen' }}>{message}</p>}
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    </section>
  );
}