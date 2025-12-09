'use client';

import React from 'react';
import TickerBar from './TickerBar';

type Props = {
  children: React.ReactNode;
};

export default function LayoutWrapper({ children }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '80px', // Platz für den fixen Header
      }}
    >
      {/* News-Banner direkt unter der Navi */}
      <TickerBar />

      {/* Seiteninhalt */}
      {children}
    </div>
  );
}