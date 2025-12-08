// src/app/account/update/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from '../reset/page.module.css';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully! You can now log in.');
      setTimeout(() => {
        router.push('/account');
      }, 2000);
    }
  };

  return (
    <section className={styles.accountLoginPage}>
      <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
        <source src="/memex-accountlogin.mp4" type="video/mp4" />
      </video>

      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Set a New Password</h2>
        <form onSubmit={handleUpdate} className={styles.loginForm}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.emailInput}
            required
          />
          <button type="submit" className={styles.loginButton}>
            Update Password
          </button>
        </form>
        {message && <p style={{ color: 'lightgreen' }}>{message}</p>}
        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    </section>
  );
}