'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TickerBar from './TickerBar';

type Props = {
  children: React.ReactNode;
};

export default function LayoutWrapper({ children }: Props) {
  const home = usePathname() === '/';

  return (
    <div
      style={{
        minHeight: home ? '100svh' : '100vh',
        paddingTop: 0, // WICHTIG: kein globaler Offset -> sonst “leere Seite” oben bei Home
        position: 'relative',
      }}
    >
      {/* News-Banner direkt unter der Navi (fixed overlay) */}
      {!home && <TickerBar />}

      {/* Seiteninhalt (Sections regeln ihren eigenen Abstand) */}
      {children}
    </div>
  );
}
