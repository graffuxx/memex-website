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

const MAX_MEMEX_PER_WALLET = 10_000_000;

export default function PrivateAccountPage() {
  const router = useRouter();
  const { publicKey } = useWallet();

  const [orders, setOrders] = useState<PresaleOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const walletAddress = publicKey?.toBase58() ?? null;

  // Wenn keine Wallet verbunden ist -> zurück zur Account-Login-Seite
  useEffect(() => {
    if (!walletAddress) {
      router.push('/account');
    }
  }, [walletAddress, router]);

  // Presale Orders laden
  useEffect(() => {
    if (!walletAddress) return;

    const loadOrders = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('presale_orders')
        .select('id, wallet, memex_amount, sol_amount, level, created_at')
        .eq('wallet', walletAddress)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading presale orders:', error);
      } else if (data) {
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

      setIsLoading(false);
    };

    loadOrders();
  }, [walletAddress]);

  const totalMemex = orders.reduce(
    (sum, o) => sum + (o.memex_amount ?? 0),
    0
  );
  const totalSol = orders.reduce(
    (sum, o) => sum + (o.sol_amount ?? 0),
    0
  );

  const progressPercent = Math.min(
    100,
    Math.max(0, (totalMemex / MAX_MEMEX_PER_WALLET) * 100)
  );

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('memex-email');
      }
    } catch (e) {
      console.warn('Could not clear local storage on logout', e);
    }
    router.push('/account');
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Video-Hintergrund */}
      <video
        className={styles.backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/memex-accountlogin.mp4" type="video/mp4" />
      </video>

      <div className={styles.overlay} />

      <main className={styles.content}>
        <section className={styles.card}>
          <header className={styles.headerRow}>
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
          </header>

          {/* CONNECTED WALLET */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Connected wallet</h2>
                <p className={styles.sectionSubtitle}>
                  The wallet currently linked to this account.
                </p>
              </div>
              <span className={styles.sectionTag}>
                {walletAddress ? 'Connected' : 'Not connected'}
              </span>
            </div>
            <div className={styles.sectionBody}>
              <p className={styles.label}>Wallet address</p>
              <p className={styles.value}>
                {walletAddress ?? '—'}
              </p>
            </div>
          </section>

          {/* PRESALE ALLOCATION */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Presale allocation</h2>
                <p className={styles.sectionSubtitle}>
                  Track how many MEMEX you have locked for launch.
                </p>
              </div>
              <span className={styles.sectionTag}>Locked MEMEX</span>
            </div>

            <div className={styles.sectionBody}>
              <div className={styles.progressRow}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className={styles.progressLabel}>
                  {totalMemex.toLocaleString()} /{' '}
                  {MAX_MEMEX_PER_WALLET.toLocaleString()} MEMEX
                </span>
              </div>

              {isLoading ? (
                <p className={styles.helperText}>Loading your orders…</p>
              ) : orders.length === 0 ? (
                <p className={styles.helperText}>
                  No presale orders found yet for this wallet. Join the presale
                  to start filling this bar with locked MEMEX.
                </p>
              ) : (
                <div className={styles.ordersList}>
                  {orders.map((order) => (
                    <div key={order.id} className={styles.orderItem}>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderLabel}>
                          Level {order.level ?? '-'}
                        </span>
                        <span className={styles.orderDate}>
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.orderValues}>
                        <span>
                          MEMEX:{' '}
                          <strong>
                            {order.memex_amount?.toLocaleString() ?? '0'}
                          </strong>
                        </span>
                        <span>
                          SOL:{' '}
                          <strong>
                            {order.sol_amount?.toLocaleString() ?? '0'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className={styles.helperText}>
                Total locked MEMEX: {totalMemex.toLocaleString()} — total SOL
                spent: {totalSol.toLocaleString()}.
              </p>
            </div>
          </section>

          {/* NFT COLLECTION */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>NFT collection</h2>
                <p className={styles.sectionSubtitle}>
                  Your MemeX cards and special NFT drops will appear here once
                  the Duelverse marketplace is live.
                </p>
              </div>
              <span className={styles.sectionTag}>Coming soon</span>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.nftGrid}>
                <div className={styles.nftSlot}>
                  <span className={styles.nftSlotLabel}>Card slot #1</span>
                  <span className={styles.nftSlotStatus}>Locked · Coming soon</span>
                </div>
                <div className={styles.nftSlot}>
                  <span className={styles.nftSlotLabel}>Card slot #2</span>
                  <span className={styles.nftSlotStatus}>Locked · Coming soon</span>
                </div>
                <div className={styles.nftSlot}>
                  <span className={styles.nftSlotLabel}>Card slot #3</span>
                  <span className={styles.nftSlotStatus}>Locked · Coming soon</span>
                </div>
                <div className={styles.nftSlot}>
                  <span className={styles.nftSlotLabel}>Card slot #4</span>
                  <span className={styles.nftSlotStatus}>Locked · Coming soon</span>
                </div>
              </div>
            </div>
          </section>

          {/* MEMEX STAKING */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>MEMEX staking</h2>
                <p className={styles.sectionSubtitle}>
                  Stake your MEMEX to earn rewards once the Duelverse is live.
                  Staking tiers are already prepared below.
                </p>
              </div>
              <span className={styles.sectionTag}>Locked</span>
            </div>

            <div className={styles.sectionBody}>
              <ul className={styles.stakingTierList}>
                <li className={styles.stakingTier}>
                  <span className={styles.stakingTierName}>Casual supporter</span>
                  <span className={styles.stakingTierStatus}>Tier coming soon</span>
                </li>
                <li className={styles.stakingTier}>
                  <span className={styles.stakingTierName}>Core duelist</span>
                  <span className={styles.stakingTierStatus}>Tier coming soon</span>
                </li>
                <li className={styles.stakingTier}>
                  <span className={styles.stakingTierName}>Void guardian</span>
                  <span className={styles.stakingTierStatus}>Tier coming soon</span>
                </li>
              </ul>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}