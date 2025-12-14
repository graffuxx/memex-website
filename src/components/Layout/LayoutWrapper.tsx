'use client';

import React from 'react';
import TickerBar from './TickerBar';

type Props = { children: React.ReactNode };

export default function LayoutWrapper({ children }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header ist fixed, Ticker ist sticky – wir geben NUR Platz für Content */}
      <div style={{ height: 120 }} /> {/* 80 Header + ~40 Ticker */}

      <TickerBar />

      <main style={{ width: '100%' }}>{children}</main>
    </div>
  );
}