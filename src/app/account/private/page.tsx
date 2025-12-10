'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import styles from '../AccountPrivate.module.css';

type PresaleOrder = {
  id: string;
  wallet: string | null;
  sol_amount: number | null;
  memex_amount: number | null;
  level: number | null;
  created_at: string | null;
  payment_status: string | null;
};

export default function AccountPrivatePage() {
  const { publicKey } = useWallet();

  const [email, setEmail] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [orders, setOrders] = useState<PresaleOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // E-Mail-User aus Supabase laden
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Supabase auth error:', error);
        return;
      }
      if (!isMounted) return;
      setEmail(data.user?.email ?? null);
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Wallet-Adresse setzen
  useEffect(() => {
    if (publicKey) {
      setWalletAddress(publicKey.toBase58());
    }
  }, [publicKey]);

  // Presale-Orders laden (nach Wallet)
  useEffect(() => {
    const loadOrders = async () => {
      if (!walletAddress) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('presale_orders')
        .select(
          'id, wallet, sol_amount, memex_amount, level, created_at, payment_status'
        )
        .eq('wallet', walletAddress)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase select error (presale_orders):', error);
        setOrders([]);
      } else {
        setOrders((data ?? []) as PresaleOrder[]);
      }
      setLoading(false);
    };

    loadOrders();
  }, [walletAddress]);

  const totalSol = orders.reduce(
    (sum, o) => sum + (o.sol_amount ?? 0),
    0
  );
  const totalMemex = orders.reduce(
    (sum, o) => sum + (o.memex_amount ?? 0),
    0
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Einfach reload – du kannst später einen Redirect auf /account machen
    window.location.href = '/account';
  };

  return (
    <div className={styles.accountWrapper}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>MY ACCOUNT</h1>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className={styles.infoRow}>
        <div className={styles.infoBox}>
          <h2>Profile</h2>
          <p>
            <strong>Email:</strong>{' '}
            {email ? email : 'No email account linked'}
          </p>
          <p>
            <strong>Wallet:</strong>{' '}
            {walletAddress ? walletAddress : 'No wallet connected'}
          </p>
        </div>

        <div className={styles.infoBox}>
          <h2>Presale Summary</h2>
          {loading ? (
            <p>Loading your presale data…</p>
          ) : orders.length === 0 ? (
            <p>No presale purchases found for this wallet.</p>
          ) : (
            <>
              <p>
                <strong>Total SOL spent:</strong> {totalSol.toFixed(3)} SOL
              </p>
              <p>
                <strong>Total MEMEX locked:</strong>{' '}
                {totalMemex.toLocaleString()} MEMEX
              </p>
              <p className={styles.helperText}>
                Your MEMEX tokens will be claimable after the presale ends.
              </p>
            </>
          )}
        </div>
      </div>

      <div className={styles.gridRow}>
        <div className={styles.sectionBox}>
          <h2>Your Presale Orders</h2>
          {loading ? (
            <p>Loading…</p>
          ) : orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className={styles.orderList}>
              {orders.map((o) => (
                <div key={o.id} className={styles.orderItem}>
                  <div className={styles.orderHeader}>
                    <span>Level {o.level ?? '-'}</span>
                    <span>{o.payment_status ?? 'pending'}</span>
                  </div>
                  <div className={styles.orderBody}>
                    <p>
                      <strong>SOL:</strong>{' '}
                      {o.sol_amount?.toFixed(3) ?? '—'}
                    </p>
                    <p>
                      <strong>MEMEX:</strong>{' '}
                      {o.memex_amount
                        ? o.memex_amount.toLocaleString()
                        : '—'}
                    </p>
                    <p className={styles.orderDate}>
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString()
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.sectionBox}>
          <h2>Your NFTs</h2>
          <p>Coming soon – your MemeX Duelverse cards will appear here.</p>
        </div>

        <div className={styles.sectionBox}>
          <h2>MEMEX Staking</h2>
          <p>Coming soon – stake your MEMEX to earn rewards after launch.</p>
        </div>
      </div>
    </div>
  );
}