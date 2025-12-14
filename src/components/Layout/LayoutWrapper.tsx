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
        paddingTop: 0, // WICHTIG: kein globaler Offset -> sonst “leere Seite” oben bei Home
        position: 'relative',
      }}
    >
      {/* News-Banner direkt unter der Navi (fixed overlay) */}
      <TickerBar />

      {/* Seiteninhalt (Sections regeln ihren eigenen Abstand) */}
      {children}
    </div>
  );
}