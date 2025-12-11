'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import styles from './AccountPrivate.module.css';

type PresaleOrder = {
  id: string;
  wallet: string | null;
  memex_amount: number | null;
  sol_amount: number | null;
  level: number | null;
  created_at: string;
};

const MAX_MEMEX_PER_WALLET = 10_000_000; // rein visueller Cap für den Fortschrittsbalken

export default function PrivateAccountPage() {
  const router = useRouter();
  const { publicKey } = useWallet();

  const walletAddress = publicKey ? publicKey.toBase58() : null;

  const [orders, setOrders] = useState<PresaleOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadOrders = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from('presale_orders')
          .select('id, wallet, memex_amount, sol_amount, level, created_at')
          .eq('wallet', walletAddress)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading presale orders:', error);
          setOrders([]);
          return;
        }

        if (data) {
          setOrders(
            data.map((row: any) => ({
              id: row.id,
              wallet: row.wallet,
              memex_amount: row.memex_amount ?? 0,
              sol_amount: row.sol_amount ?? 0,
              level: row.level ?? null,
              created_at: row.created_at,
            }))
          );
        }
      } catch (err) {
        console.error('Unexpected error while loading presale orders:', err);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, [walletAddress]);

  const totalMemex = orders.reduce(
    (sum, o) => sum + (o.memex_amount ?? 0),
    0
  );
  const totalSol = orders.reduce(
    (sum, o) => sum + (o.sol_amount ?? 0),
    0
  );

  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      MAX_MEMEX_PER_WALLET > 0
        ? (totalMemex / MAX_MEMEX_PER_WALLET) * 100
        : 0
    )
  );

  const handleLogout = () => {
    // Für später kannst du hier Supabase-Sessions o.ä. ergänzen
    window.location.href = '/account';
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Video-Hintergrund */}
      <video
        className={styles.videoBg}
        src="/memex-accountlogin.mp4"
        autoPlay
        muted
        playsInline
        loop
      />

      {/* dunkle Overlay-Fläche über dem Video */}
      <div className={styles.videoOverlay} />

      {/* Haupt-Content */}
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>My Account</h1>
            <p className={styles.subtitle}>
              Overview of your locked MEMEX, future NFTs and staking.
            </p>
          </div>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className={styles.sectionsGrid}>
          {/* CONNECTED WALLET */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Connected Wallet</h2>
              <span className={styles.sectionBadge}>
                {walletAddress ? 'Connected' : 'Not connected'}
              </span>
            </div>
            <div className={styles.sectionBody}>
              <p className={styles.statLabel}>Wallet address</p>
              <p className={styles.walletAddress}>
                {walletAddress ??
                  'No wallet connected. Please connect your wallet on the Account page.'}
              </p>
            </div>
          </section>

          {/* PRESALE ALLOCATION */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Presale Allocation</h2>
              <span className={styles.sectionBadge}>Locked MEMEX</span>
            </div>
            <div className={styles.sectionBody}>
              {isLoading ? (
                <p className={styles.helperText}>
                  Loading your presale orders…
                </p>
              ) : orders.length === 0 ? (
                <p className={styles.helperText}>
                  No presale orders found yet for this wallet. Join the presale
                  to start filling this bar with locked MEMEX.
                </p>
              ) : (
                <>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>
                      Total locked MEMEX
                    </span>
                    <span className={styles.statValue}>
                      {totalMemex.toLocaleString()} MEMEX
                    </span>
                  </div>

                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Total paid in SOL</span>
                    <span className={styles.statValue}>
                      {totalSol.toLocaleString()} SOL
                    </span>
                  </div>

                  <div className={styles.progressWrapper}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressInner}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className={styles.progressLabel}>
                      {progressPercent.toFixed(1)}% of your personal MEMEX cap
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* NFT COLLECTION */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>NFT Collection</h2>
              <span className={styles.sectionBadge}>Coming soon</span>
            </div>
            <div className={styles.sectionBody}>
              <p className={styles.helperText}>
                Your MemeX cards and special NFT drops will appear here once the
                Duelverse marketplace is live.
              </p>

              <div className={styles.nftGrid}>
                {['Card slot #1', 'Card slot #2', 'Card slot #3', 'Card slot #4'].map(
                  (label) => (
                    <div key={label} className={styles.nftSlot}>
                      <span className={styles.nftLabel}>{label}</span>
                      <span className={styles.nftStatus}>
                        Locked · Coming soon
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* MEMEX STAKING */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>MEMEX Staking</h2>
              <span className={styles.sectionBadge}>Locked</span>
            </div>
            <div className={`${styles.sectionBody} ${styles.stakingBody}`}>
              <p className={styles.helperText}>
                Stake your MEMEX to earn rewards once the Duelverse is live.
                Tiers are already prepared below.
              </p>

              <ul className={styles.stakingList}>
                <li className={styles.stakingRow}>
                  <span className={styles.stakingTier}>Casual Supporter</span>
                  <span className={styles.stakingStatus}>Coming soon</span>
                </li>
                <li className={styles.stakingRow}>
                  <span className={styles.stakingTier}>Core Duelist</span>
                  <span className={styles.stakingStatus}>Coming soon</span>
                </li>
                <li className={styles.stakingRow}>
                  <span className={styles.stakingTier}>Void Guardian</span>
                  <span className={styles.stakingStatus}>Coming soon</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}