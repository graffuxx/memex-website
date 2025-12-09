'use client';

import React from 'react';
import TickerBar from './TickerBar';

type Props = {
  children: React.ReactNode;
};

export default function LayoutWrapper({ children }: Props) {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* News / Ticker oben unter der Navbar */}
      <TickerBar />
      {/* Platz für Header + Ticker, damit nichts überlappt */}
      <div style={{ paddingTop: '110px' }}>
        {children}
      </div>
    </div>
  );
}