// app/layout.tsx
import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import ModernHeader from '@/components/Layout/ModernHeader';
import WalletConnectionProvider from '@/components/Wallet/WalletConnectionProvider';
import LayoutWrapper from '@/components/Layout/LayoutWrapper';

export const metadata: Metadata = {
  title: 'MemeX Duelverse – MEMEX Presale',
  description:
    'A meme-fueled trading card game on Solana. Join the MEMEX presale with 10 levels, random NFT drops and a community-powered Duelverse.',
  metadataBase: new URL('https://memexduelverse.com'),
  openGraph: {
    title: 'MemeX Duelverse – MEMEX Presale',
    description:
      'Join the MEMEX presale and prepare for the Duelverse. 10 levels, best rate in Level 1, random NFT drops.',
    url: 'https://memexduelverse.com',
    siteName: 'MemeX Duelverse',
    images: [
      {
        url: '/og-memex.png',
        width: 1200,
        height: 630,
        alt: 'MemeX Duelverse Presale',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemeX Duelverse – MEMEX Presale',
    description:
      'MemeX is a meme-fueled trading card game on Solana. Join the MEMEX presale and get in early.',
    images: ['/og-memex.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <WalletConnectionProvider>
          <ModernHeader />
          <LayoutWrapper>
            <main>{children}</main>
          </LayoutWrapper>
        </WalletConnectionProvider>
      </body>
    </html>
  );
}