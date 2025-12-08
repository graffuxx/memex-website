// components/Layout/LayoutWrapper.tsx
'use client';

import TickerBar from './TickerBar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TickerBar />
      {children}
    </>
  );
}