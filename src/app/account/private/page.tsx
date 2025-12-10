'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import styles from './AccountPrivate.module.css';

type PresaleOrder = {
  id: string;
  created_at: string;
  wallet: string | null;
  sol_amount: number | null;
  memex_amount: number | null;
  level: number | null;
  payment_status: string | null;
};

export default function AccountPrivatePage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PresaleOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wenn keine Wallet verbunden ist, zurück zur öffentlichen Account-Seite
    if (!connected || !publicKey) {
      router.push('/account');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const walletAddress = publicKey.toBase58();

        const { data, error } = await supabase
          .from('presale_orders')
          .select(
            `
            id,
            created_at,
            wallet,
            sol_amount,
            memex_amount,
            level,
            payment_status
          `
          )
          .eq('wallet', walletAddress)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error loading presale_orders:', error);
          setError('Could not load your presale data. Please try again later.');
        } else if (data) {
          setOrders(data as PresaleOrder[]);
        }
      } catch (err) {
        console.error('Unknown error loading presale_orders:', err);
        setError('Unexpected error while loading your account data.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [connected, publicKey, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut error:', err);
    } finally {
      router.push('/account');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>My Account</h1>
            <p className={styles.subtitle}>
              Overview of your locked MEMEX, future NFTs and staking.
            </p>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Wallet Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Connected Wallet</h2>
          <div className={styles.infoBox}>
            <p className={styles.infoLabel}>Wallet Address</p>
            <p className={styles.infoValue}>
              {publicKey ? publicKey.toBase58() : 'Not connected'}
            </p>
          </div>
        </section>

        {/* Presale Orders */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Presale Allocation</h2>

          {loading && <p className={styles.muted}>Loading your MEMEX allocation…</p>}
          {error && <p className={styles.errorText}>{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <p className={styles.muted}>
              No presale orders found yet for this wallet.
            </p>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className={styles.cardGrid}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.badge}>
                      Level {order.level ?? '-'}
                    </span>
                    <span className={styles.status}>
                      {order.payment_status ?? 'pending'}
                    </span>
                  </div>
                  <div className={styles.orderBody}>
                    <div className={styles.orderRow}>
                      <span>SOL contributed</span>
                      <span>{order.sol_amount ?? 0}</span>
                    </div>
                    <div className={styles.orderRow}>
                      <span>MEMEX allocated</span>
                      <span>{order.memex_amount?.toLocaleString() ?? 0}</span>
                    </div>
                    <div className={styles.orderRowSmall}>
                      <span>Purchase date</span>
                      <span>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NFTs Placeholder */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>NFT Collection</h2>
          <div className={styles.placeholderBox}>
            <p className={styles.placeholderTitle}>NFT inventory coming soon</p>
            <p className={styles.placeholderText}>
              Your MemeX cards and special NFT drops will appear here once the
              Duelverse marketplace is live.
            </p>
          </div>
        </section>

        {/* Staking Placeholder */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>MEMEX Staking</h2>
          <div className={styles.placeholderBox}>
            <p className={styles.placeholderTitle}>Staking launches after presale</p>
            <p className={styles.placeholderText}>
              Lock your MEMEX to earn rewards and unlock elite Duelverse
              features. Staking goes live after the main presale is completed.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}