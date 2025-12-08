'use client';

import React from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

import styles from './WalletButton.module.css';

export default function WalletButton() {
  const { setVisible } = useWalletModal();
  const { connected, publicKey } = useWallet();

  const handleClick = () => {
    setVisible(true);
  };

  return (
    <button onClick={handleClick} className={styles.wallet}>
      {connected && publicKey
        ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
        : 'Select Wallet'}
    </button>
  );
}