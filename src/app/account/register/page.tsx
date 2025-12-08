'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from '../page.module.css';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.includes('@')) {
      return setError('Please enter a valid email address.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://memexduelverse.com/account/private',
      },
    });

    if (signUpError) {
      return setError(signUpError.message);
    }

    setSuccess('Verification email sent! Please check your inbox.');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <section className={styles.accountLoginPage}>
      {/* Hintergrundvideo */}
      <video autoPlay muted loop playsInline className={styles.backgroundVideo}>
        <source src="/memex-accountlogin.mp4" type="video/mp4" />
      </video>

      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Create Your Duelverse Account</h2>

        <form onSubmit={handleRegister} className={styles.loginForm}>
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

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.emailInput}
            required
          />

          <button type="submit" className={styles.loginButton}>
            Register
          </button>

          {error && <p className={styles.errorText}>{error}</p>}
          {success && <p className={styles.successText}>{success}</p>}
        </form>

        <div className={styles.or}>OR</div>
        <div className={styles.registerText}>
          Already have an account?{' '}
          <a href="/account">Login here</a>
        </div>
      </div>
    </section>
  );
}