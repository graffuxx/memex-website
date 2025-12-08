'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from '@/components/AccountPrivate.module.css';
import { getUserData } from '@/lib/accountData';
import { supabase } from '@/lib/supabaseClient';

export default function PrivateAccountPage() {
  const { publicKey } = useWallet();
  const router = useRouter();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('memexUser');
    const parsed = storedUser ? JSON.parse(storedUser) : null;

    if (parsed?.email) {
      getUserData(null, parsed.email).then((res) => {
        setData(res);
        setLoading(false);
      });
    } else if (publicKey) {
      const address = publicKey.toBase58();
      setWalletAddress(address);
      getUserData(address, null).then((res) => {
        setData(res);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [publicKey]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('memexUser');
    router.push('/account');
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!data) return <div className={styles.error}>No data found.</div>;

  return (
    <section className={styles.accountWrapper}>
      {/* Background */}
      <video autoPlay muted playsInline className={styles.backgroundVideo}>
        <source src="/memex-accountlogin.mp4" type="video/mp4" />
      </video>

      {/* Logout Button */}
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>

      <div className={styles.content}>
        <h1 className={styles.title}>MY ACCOUNT</h1>

        {/* Presale Summary */}
        <div className={styles.sectionBox}>
          <h2>Presale Summary</h2>
          <p>Total MEMEX Purchased: <strong>{data.memexPurchased}</strong></p>
          <p>Status: Locked until Presale ends</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '45%' }}></div>
          </div>
        </div>

        {/* NFT Section */}
        <div className={styles.sectionBox}>
          <h2>Your NFT Cards</h2>
          <div className={styles.nftGrid}>
            {data.nfts?.length > 0 ? (
              data.nfts.map((nft: any, idx: number) => (
                <div key={idx} className={styles.nftCard}>
                  <img src={nft.image} alt={nft.name} />
                  <p>{nft.name}</p>
                </div>
              ))
            ) : (
              <p>No NFTs found.</p>
            )}
          </div>
        </div>

        {/* Staking (Coming Soon) */}
        <div className={`${styles.sectionBox} ${styles.disabledBox}`}>
          <h2>Stake MEMEX</h2>
          <p className={styles.comingSoon}>
            {data.staking?.info || 'Coming Soon...'}
          </p>
          <button className={styles.disabledButton} disabled>
            Start Staking
          </button>
        </div>
      </div>
    </section>
  );
}