'use client';

import React, { useEffect, useState } from 'react';
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

const MAX_MEMEX_PER_WALLET = 1_000_000; // Placeholder, später anpassbar

export default function PrivateAccountPage() {
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() ?? null;

  const [orders, setOrders] = useState<PresaleOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('presale_orders')
          .select('id, wallet, memex_amount, sol_amount, level, created_at')
          .eq('wallet', walletAddress)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading presale orders', error);
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
        console.error('Unexpected error loading presale orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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
    Math.min(100, (totalMemex / MAX_MEMEX_PER_WALLET) * 100)
  );

  const handleLogout = () => {
    // Später Supabase-/Session-Logout ergänzen
    window.location.href = '/account';
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>MY ACCOUNT</h1>
            <p className={styles.subtitle}>
              OVERVIEW OF YOUR LOCKED MEMEX, FUTURE NFT DROPS AND STAKING.
            </p>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            LOGOUT
          </button>
        </header>

        {/* CONNECTED WALLET */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>CONNECTED WALLET</h2>
            <span className={styles.sectionTag}>
              {connected ? 'CONNECTED' : 'NOT CONNECTED'}
            </span>
          </div>
          <p className={styles.label}>WALLET ADDRESS</p>
          <p className={styles.walletAddress}>
            {walletAddress ?? 'NO WALLET CONNECTED'}
          </p>
        </section>

        {/* PRESALE ALLOCATION */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>PRESALE ALLOCATION</h2>
            {totalMemex > 0 && (
              <span className={styles.sectionTag}>
                LOCKED MEMEX: {totalMemex.toLocaleString()}
              </span>
            )}
          </div>

          {loading ? (
            <p className={styles.muted}>Loading your presale data…</p>
          ) : totalMemex > 0 ? (
            <>
              <div className={styles.allocationStats}>
                <div>
                  <p className={styles.label}>LOCKED MEMEX</p>
                  <p className={styles.value}>
                    {totalMemex.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className={styles.label}>TOTAL SOL SPENT</p>
                  <p className={styles.value}>
                    {totalSol.toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                    })}{' '}
                    SOL
                  </p>
                </div>
                <div>
                  <p className={styles.label}>PRESALE ORDERS</p>
                  <p className={styles.value}>{orders.length}</p>
                </div>
              </div>

              <div className={styles.progressBarOuter}>
                <div
                  className={styles.progressBarInner}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className={styles.progressHint}>
                MEMEX REMAINS LOCKED UNTIL THE PRESALE ENDS. CLAIM AND STAKING
                OPTIONS WILL APPEAR HERE.
              </p>
            </>
          ) : (
            <div className={styles.comingSoonBox}>
              <p className={styles.comingSoonTitle}>
                NO PRESALE ORDERS FOUND YET FOR THIS WALLET.
              </p>
              <p className={styles.muted}>
                JOIN THE PRESALE TO START FILLING THIS BAR WITH LOCKED MEMEX.
              </p>
            </div>
          )}
        </section>

        {/* NFT COLLECTION */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>NFT COLLECTION</h2>
            <span className={styles.sectionTag}>COMING SOON</span>
          </div>
          <p className={styles.muted}>
            YOUR MEMEX CARDS AND SPECIAL NFT DROPS WILL APPEAR HERE ONCE THE
            DUELVERSE MARKETPLACE IS LIVE.
          </p>

          <div className={styles.nftGrid}>
            {[1, 2, 3, 4].map((slot) => (
              <div key={slot} className={styles.nftCard}>
                <div className={styles.nftArtPlaceholder} />
                <div className={styles.nftInfoRow}>
                  <span className={styles.nftTitle}>
                    CARD SLOT #{slot}
                  </span>
                  <span className={styles.nftRarityTag}>LOCKED</span>
                </div>
                <div className={styles.nftOverlay}>
                  <span>COMING SOON</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STAKING */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>MEMEX STAKING</h2>
            <span className={styles.sectionTag}>LOCKED</span>
          </div>
          <p className={styles.muted}>
            STAKE YOUR MEMEX TO EARN REWARDS ONCE THE DUELVERSE IS LIVE. TIERS
            ARE ALREADY PREPARED BELOW.
          </p>

          <div className={styles.stakingGrid}>
            {[
              { label: 'TIER I', desc: 'CASUAL SUPPORTER', apy: 'TBA' },
              { label: 'TIER II', desc: 'CORE DUELIST', apy: 'TBA' },
              { label: 'TIER III', desc: 'VOID GUARDIAN', apy: 'TBA' },
            ].map((tier) => (
              <div key={tier.label} className={styles.stakingCard}>
                <div className={styles.stakingHeader}>
                  <span className={styles.stakingLabel}>
                    {tier.label}
                  </span>
                  <span className={styles.stakingComingSoon}>
                    COMING SOON
                  </span>
                </div>
                <p className={styles.stakingDesc}>{tier.desc}</p>
                <div className={styles.stakingFooter}>
                  <span className={styles.label}>APY</span>
                  <span className={styles.value}>{tier.apy}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}