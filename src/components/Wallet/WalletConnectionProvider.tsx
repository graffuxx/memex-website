"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider
} from "@solana/wallet-adapter-react-ui";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

const endpoint = "https://api.mainnet-beta.solana.com";

const WalletConnectionProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletConnectionProvider;