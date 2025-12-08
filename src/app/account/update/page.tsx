'use client';

import styles from '../page.module.css';

export default function UpdatePasswordPage() {
  return (
    <div className={styles.accountContainer}>
      <div className={styles.card}>
        <h1 className={styles.title}>Update Password</h1>
        <p className={styles.subtitle}>
          Password updates are currently disabled while we prepare the MEMEX presale.
        </p>
        <p className={styles.subtitle}>
          If you requested a reset link, please try again later – account features will be
          fully available after the presale launch.
        </p>
      </div>
    </div>
  );
}