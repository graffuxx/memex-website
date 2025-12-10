'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from '../page.module.css';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic Checks
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password should be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);

      // Debug-Log: wir wollen GENAU sehen, was Supabase zurückgibt
      console.log('[Register] submitting signUp', { email });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('[Register] signUp result:', { data, error });

      if (error) {
        console.error('Supabase signUp error:', error);
        setErrorMessage(error.message || 'Registration failed. Please try again.');
        return;
      }

      // Falls Supabase nichts zurückgibt (sehr unwahrscheinlich), trotzdem abbrechen
      if (!data) {
        setErrorMessage('No response from auth server. Please try again.');
        return;
      }

      // Direkt nach erfolgreichem SignUp einloggen
      const {
        data: signInData,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[Register] signIn after signUp:', { signInData, signInError });

      if (signInError) {
        // Account ist angelegt, Login hat aber nicht geklappt
        console.error('Supabase signIn error after signUp:', signInError);
        setSuccessMessage(
          'Your account has been created, but automatic login failed. Please try to log in manually.'
        );
        setErrorMessage(signInError.message);
        return;
      }

      // Alles gut: direkt in den privaten Bereich
      router.push('/account/private');
    } catch (err) {
      console.error('Unexpected error during registration:', err);
      setErrorMessage('Unexpected error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your MemeX Account</h1>
        <p className={styles.subtitle}>
          Register with your email to link your future MEMEX purchases and NFT drops to a private account.
        </p>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabButton} ${styles.tabInactive}`}
            onClick={() => router.push('/account')}
          >
            Login
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${styles.tabActive}`}
          >
            Register
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Email
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              required
            />
          </label>

          <label className={styles.label}>
            Repeat Password
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
            />
          </label>

          {errorMessage && (
            <div className={styles.errorMessage}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Creating your account…' : 'Create my account'}
          </button>
        </form>

        <p className={styles.helperText}>
          Already have an account?{' '}
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => router.push('/account')}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}