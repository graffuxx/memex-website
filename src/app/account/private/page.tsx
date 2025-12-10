'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import styles from './AccountPrivate.module.css';

type PresaleOrder = {
  id: string;
  level: number | null;
  sol_amount: number | null;
  memex_amount: number | null;
  tx_hash: string | null;
  created_at: string;
};

export default function AccountPrivatePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();

  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<PresaleOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      // Supabase-User (Mail) holen
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user ?? null;
      if (user?.email) setEmail(user.email);

      // Wenn weder Wallet noch Mail-User vorhanden -> zurück zur Login-Seite
      if (!user && (!connected || !publicKey)) {
        router.replace('/account');
        return;
      }

      // Wenn Wallet da ist, Presale-Orders laden
      if (connected && publicKey) {
        const { data, error } = await supabase
          .from('presale_orders')
          .select('id, level, sol_amount, memex_amount, tx_hash, created_at')
          .eq('wallet', publicKey.toBase58())
          .order('created_at', { ascending: false });

        if (!error && data) {
          setOrders(data as PresaleOrder[]);
        } else if (error) {
          console.error('Error loading presale_orders:', error);
        }
      }

      setLoading(false);
    };

    run();
  }, [connected, publicKey, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/account');
  };

  const totalMemex = orders.reduce(
    (sum, o) => sum + (o.memex_amount || 0),
    0
  );
  const totalSol = orders.reduce((sum, o) => sum + (o.sol_amount || 0), 0);

  return (
    <div className={styles.wrapper}>
      <button className={styles.logout} onClick={handleLogout}>
        Logout
      </button>

      <h1 className={styles.title}>MY ACCOUNT</h1>

      {loading ? (
        <p className={styles.info}>Loading your data...</p>
      ) : (
        <>
          <section className={styles.identity}>
            {publicKey && (
              <p>
                Wallet: <span>{publicKey.toBase58()}</span>
              </p>
            )}
            {email && (
              <p>
                Email: <span>{email}</span>
              </p>
            )}
          </section>

          <section className={styles.summary}>
            <h2>Presale Summary</h2>
            {orders.length === 0 ? (
              <p>No presale purchases found for this wallet yet.</p>
            ) : (
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Total MEMEX</span>
                  <span className={styles.summaryValue}>
                    {totalMemex.toLocaleString()}
                  </span>
                </div>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Total SOL spent</span>
                  <span className={styles.summaryValue}>
                    {totalSol.toFixed(3)} SOL
                  </span>
                </div>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Orders</span>
                  <span className={styles.summaryValue}>
                    {orders.length}
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className={styles.orders}>
            <h2>Your Presale Orders</h2>
            {orders.length === 0 ? (
              <p>No orders so far.</p>
            ) : (
              <div className={styles.ordersTable}>
                <div className={styles.ordersHeader}>
                  <span>Date</span>
                  <span>Level</span>
                  <span>SOL</span>
                  <span>MEMEX</span>
                  <span>Tx</span>
                </div>
                {orders.map((o) => (
                  <div key={o.id} className={styles.ordersRow}>
                    <span>
                      {new Date(o.created_at).toLocaleDateString()}
                    </span>
                    <span>{o.level ?? '-'}</span>
                    <span>
                      {o.sol_amount !== null
                        ? o.sol_amount.toFixed(3)
                        : '-'}
                    </span>
                    <span>
                      {o.memex_amount !== null
                        ? o.memex_amount.toLocaleString()
                        : '-'}
                    </span>
                    <span>
                      {o.tx_hash ? (
                        <a
                          href={`https://solscan.io/tx/${o.tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        '-'
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.nfts}>
            <h2>Your NFTs</h2>
            <p>Coming soon – your MemeX NFT collection will appear here.</p>
          </section>

          <section className={styles.staking}>
            <h2>MEMEX Staking</h2>
            <p>Staking will open after the presale. Stay tuned.</p>
          </section>
        </>
      )}
    </div>
  );
}