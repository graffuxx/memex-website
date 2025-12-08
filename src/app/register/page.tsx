'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from '@/components/Account.module.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setError('');
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your inbox to confirm your email.');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className={styles.accountLoginPage}>
      <div className={styles.loginBox}>
        <h2>Create Account</h2>

        <input
          className={styles.loginInput}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.loginInput}
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className={styles.loginButton} onClick={handleRegister}>Register</button>

        {message && <p style={{ color: '#8c4fff', marginTop: '16px' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}

        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '20px' }}>
          Already have an account? <a href="/account" style={{ color: '#c275ff' }}>Login here</a>
        </p>
      </div>
    </div>
  );
}