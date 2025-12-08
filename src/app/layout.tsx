// app/layout.tsx
import './globals.css';
import React from 'react';
import ModernHeader from '@/components/Layout/ModernHeader';
import WalletConnectionProvider from '@/components/Wallet/WalletConnectionProvider';
import LayoutWrapper from '@/components/Layout/LayoutWrapper';

export const metadata = {
  title: 'Memex – Duelverse',
  description: 'Join the Memex presale and become part of the Duelverse.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metadata.description} />
        <title>{metadata.title}</title>
      </head>
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