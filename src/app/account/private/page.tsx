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

const MAX_MEMEX_PER_WALLET = 1_000_000; // placeholder cap for progress bar

export default function PrivateAccountPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() ?? null;

  const [orders, setOrders] = useState<PresaleOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!walletAddress) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
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

        const mapped: PresaleOrder[] =
          (data ?? []).map((row: any) => ({
            id: row.id,
            wallet: row.wallet,
            memex_amount: row.memex_amount ?? 0,
            sol_amount: row.sol_amount ?? 0,
            level: row.level ?? null,
            created_at: row.created_at,
          })) || [];

        setOrders(mapped);
      } catch (err) {
        console.error('Unexpected error while loading presale orders:', err);
        setOrders([]);
      } finally {
        setIsLoading(false);
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
    Math.min(
      100,
      MAX_MEMEX_PER_WALLET > 0
        ? Math.round((totalMemex / MAX_MEMEX_PER_WALLET) * 100)
        : 0
    )
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      router.push('/account');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <video
        className={styles.videoBackground}
        src="/memex-accountlogin.mp4"
        autoPlay
        muted
        playsInline
      />
      <div className={styles.videoOverlay} />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
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

        {/* CONNECTED WALLET */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Connected Wallet</h2>
            <span className={styles.sectionTag}>
              {walletAddress ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <p className={styles.label}>Wallet Address</p>
          <p className={styles.value}>
            {walletAddress ?? 'No wallet linked. Please connect your wallet from the Account page.'}
          </p>
        </section>

        {/* PRESALE ALLOCATION */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Presale Allocation</h2>
            <span className={styles.sectionTag}>
              {totalMemex > 0 ? 'Locked MEMEX' : 'No Orders Yet'}
            </span>
          </div>

          {isLoading ? (
            <p className={styles.helperText}>Loading your presale data…</p>
          ) : orders.length === 0 ? (
            <p className={styles.helperText}>
              No presale orders found yet for this wallet. Join the presale to
              start filling this bar with locked MEMEX.
            </p>
          ) : (
            <>
              <div className={styles.progressWrapper}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className={styles.progressMeta}>
                  <span>
                    Locked MEMEX:{' '}
                    <strong>
                      {totalMemex.toLocaleString()} /{' '}
                      {MAX_MEMEX_PER_WALLET.toLocaleString()}
                    </strong>
                  </span>
                  <span>
                    Total SOL spent:{' '}
                    <strong>{totalSol.toFixed(3)} SOL</strong>
                  </span>
                </div>
              </div>

              <ul className={styles.orderList}>
                {orders.map((order) => (
                  <li key={order.id} className={styles.orderItem}>
                    <div className={styles.orderMain}>
                      <span className={styles.orderLabel}>
                        Level {order.level ?? '-'}
                      </span>
                      <span className={styles.orderMemex}>
                        {order.memex_amount?.toLocaleString() ?? 0} MEMEX
                      </span>
                    </div>
                    <div className={styles.orderMeta}>
                      <span>{order.sol_amount?.toFixed(3) ?? 0} SOL</span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* NFT COLLECTION */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>NFT Collection</h2>
            <span className={styles.sectionTagMuted}>Coming Soon</span>
          </div>
          <p className={styles.helperText}>
            Your MemeX cards and special NFT drops will appear here once the
            Duelverse marketplace is live.
          </p>
          <div className={styles.nftGrid}>
            <div className={styles.nftSlot}>
              <span className={styles.nftSlotTitle}>Card Slot #1</span>
              <span className={styles.nftSlotStatus}>Locked · Coming Soon</span>
            </div>
            <div className={styles.nftSlot}>
              <span className={styles.nftSlotTitle}>Card Slot #2</span>
              <span className={styles.nftSlotStatus}>Locked · Coming Soon</span>
            </div>
            <div className={styles.nftSlot}>
              <span className={styles.nftSlotTitle}>Card Slot #3</span>
              <span className={styles.nftSlotStatus}>Locked · Coming Soon</span>
            </div>
            <div className={styles.nftSlot}>
              <span className={styles.nftSlotTitle}>Card Slot #4</span>
              <span className={styles.nftSlotStatus}>Locked · Coming Soon</span>
            </div>
          </div>
        </section>

        {/* MEMEX STAKING */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>MEMEX Staking</h2>
            <span className={styles.sectionTagMuted}>Locked</span>
          </div>
          <p className={styles.helperText}>
            Stake your MEMEX to earn rewards once the Duelverse is live.
            Tiers are already prepared below.
          </p>

          <div className={styles.stakingGrid}>
            <div className={styles.stakingTier}>
              <h3 className={styles.stakingTitle}>Tier I · Casual Supporter</h3>
              <p className={styles.stakingText}>Entry staking tier · Coming soon.</p>
            </div>
            <div className={styles.stakingTier}>
              <h3 className={styles.stakingTitle}>Tier II · Core Duelist</h3>
              <p className={styles.stakingText}>
                Higher rewards for active community members · Coming soon.
              </p>
            </div>
            <div className={styles.stakingTier}>
              <h3 className={styles.stakingTitle}>Tier III · Void Guardian</h3>
              <p className={styles.stakingText}>
                Top tier staking for the strongest supporters · Coming soon.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}