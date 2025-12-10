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
  created_at: string | null;
};

const MAX_MEMEX_PER_WALLET = 10_000_000; // Beispiel-Cap für Fortschrittsbalken

export default function PrivateAccountPage() {
  const router = useRouter();
  const { publicKey, disconnect } = useWallet();

  const [orders, setOrders] = useState<PresaleOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Auth + Orders laden
  useEffect(() => {
    const address = publicKey ? publicKey.toBase58() : null;
    setWalletAddress(address);

    const loadData = async () => {
      // 1) Supabase-User checken
      const { data } = await supabase.auth.getUser();

      if (!data.user && !address) {
        // Weder E-Mail-Login noch Wallet → zurück zur Login-Seite
        router.push('/account');
        return;
      }

      // 2) Presale-Orders nur laden, wenn eine Wallet vorhanden ist
      if (address) {
        try {
          const { data: rows, error } = await supabase
            .from('presale_orders')
            .select('id, wallet, memex_amount, sol_amount, level, created_at')
            .eq('wallet', address)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error loading presale_orders:', error);
          } else if (rows) {
            setOrders(
              rows.map((row: any) => ({
                id: row.id,
                wallet: row.wallet,
                memex_amount: row.memex_amount ?? 0,
                sol_amount: row.sol_amount ?? 0,
                level: row.level ?? null,
                created_at: row.created_at ?? null,
              }))
            );
          }
        } catch (err) {
          console.error('Unexpected error loading orders:', err);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, [publicKey, router]);

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut error:', err);
    }

    try {
      if (disconnect) {
        await disconnect();
      }
    } catch (err) {
      console.error('Wallet disconnect error:', err);
    }

    router.push('/account');
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Background Video */}
      <div className={styles.videoBackground}>
        <video
          className={styles.video}
          src="/memex-accountlogin.mp4"
          autoPlay
          muted
          playsInline
          loop={false}
        />
        <div className={styles.videoOverlay} />
      </div>

      <main className={styles.content}>
        <header className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>MY ACCOUNT</h1>
            <p className={styles.subtitle}>
              Overview of your locked MEMEX, future NFTs and staking.
            </p>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* CONNECTED WALLET */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>CONNECTED WALLET</h2>
            <span className={styles.panelTagActive}>Connected</span>
          </div>
          <div className={styles.walletLine}>
            <span className={styles.label}>Wallet address</span>
            <span className={styles.value}>
              {walletAddress ?? 'No wallet connected'}
            </span>
          </div>
        </section>

        {/* PRESALE ALLOCATION */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>PRESALE ALLOCATION</h2>
            {totalMemex > 0 ? (
              <span className={styles.panelTagActive}>Locked MEMEX</span>
            ) : (
              <span className={styles.panelTagMuted}>No orders yet</span>
            )}
          </div>

          <p className={styles.textSmall}>
            This bar shows how many MEMEX you have locked for this wallet. Join the
            presale to start filling it up.
          </p>

          <div className={styles.progressRow}>
            <span className={styles.progressLabel}>Locked MEMEX</span>
            <span className={styles.progressValue}>
              {totalMemex.toLocaleString('en-US')} /{' '}
              {MAX_MEMEX_PER_WALLET.toLocaleString('en-US')}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className={styles.orderSummaryRow}>
            <div>
              <span className={styles.label}>Total orders</span>
              <span className={styles.value}>{orders.length}</span>
            </div>
            <div>
              <span className={styles.label}>Total SOL spent</span>
              <span className={styles.value}>{totalSol.toFixed(2)} SOL</span>
            </div>
            <div>
              <span className={styles.label}>Status</span>
              <span className={styles.value}>
                {totalMemex > 0 ? 'Waiting for presale claim' : 'No allocation yet'}
              </span>
            </div>
          </div>

          {isLoading && (
            <p className={styles.textSmall}>Loading your orders…</p>
          )}
          {!isLoading && orders.length === 0 && (
            <p className={styles.textSmall}>
              No presale orders found for this wallet. Join the presale to lock your
              first MEMEX.
            </p>
          )}
        </section>

        {/* NFT COLLECTION */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>NFT COLLECTION</h2>
            <span className={styles.panelTagMuted}>Coming soon</span>
          </div>
          <p className={styles.textSmall}>
            Your MemeX cards and special NFT drops will appear here once the Duelverse
            marketplace is live.
          </p>

          <div className={styles.nftGrid}>
            <div className={styles.nftSlot}>
              <span className={styles.nftLabel}>Card slot #1</span>
              <span className={styles.nftState}>Locked</span>
              <span className={styles.nftHint}>Coming soon</span>
            </div>
            <div className={styles.nftSlot}>
              <span className={styles.nftLabel}>Card slot #2</span>
              <span className={styles.nftState}>Locked</span>
              <span className={styles.nftHint}>Coming soon</span>
            </div>
            <div className={styles.nftSlot}>
              <span className={styles.nftLabel}>Card slot #3</span>
              <span className={styles.nftState}>Locked</span>
              <span className={styles.nftHint}>Coming soon</span>
            </div>
            <div className={styles.nftSlot}>
              <span className={styles.nftLabel}>Card slot #4</span>
              <span className={styles.nftState}>Locked</span>
              <span className={styles.nftHint}>Coming soon</span>
            </div>
          </div>
        </section>

        {/* MEMEX STAKING */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>MEMEX STAKING</h2>
            <span className={styles.panelTagMuted}>Locked</span>
          </div>
          <p className={styles.textSmall}>
            Stake your MEMEX to earn rewards once the Duelverse is live. Tiers are
            already prepared below.
          </p>

          <div className={styles.stakingGrid}>
            <div className={styles.stakingTier}>
              <div className={styles.tierTitle}>Casual Supporter</div>
              <div className={styles.tierBody}>
                <span className={styles.tierState}>Coming soon</span>
                <span className={styles.tierHint}>Perfect for early duelists.</span>
              </div>
            </div>
            <div className={styles.stakingTier}>
              <div className={styles.tierTitle}>Core Duelist</div>
              <div className={styles.tierBody}>
                <span className={styles.tierState}>Coming soon</span>
                <span className={styles.tierHint}>Higher lock, higher rewards.</span>
              </div>
            </div>
            <div className={styles.stakingTier}>
              <div className={styles.tierTitle}>Void Guardian</div>
              <div className={styles.tierBody}>
                <span className={styles.tierState}>Coming soon</span>
                <span className={styles.tierHint}>
                  Ultra-rare tier for the most devoted MemeX supporters.
                </span>
              </div>
            </div>
          </div>

          <div className={styles.overlayLabel}>COMING SOON</div>
        </section>
      </main>
    </div>
  );
}