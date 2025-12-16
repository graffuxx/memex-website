'use client';

import React, { useMemo, useState } from 'react';

type PayPalSupportCheckoutProps = {
  wallet: string | null;
  level: number;
  solAmount: number;
  memexAmount: number;
  baseEurAmount: number;
  totalEurAmount: number;
  feeMultiplier?: number; // defaults to 1.02
};

type SupportPack = {
  label: string;
  baseEur: number;
};

const PACKS: SupportPack[] = [
  { label: '€100 — Rookie Support', baseEur: 100 },
  { label: '€250 — Veteran Support', baseEur: 250 },
  { label: '€500 — Pro Support', baseEur: 500 },
  { label: '€1000 — Over 9000! Support', baseEur: 1000 },
];

export default function PayPalSupportCheckout({
  wallet,
  level,
  solAmount,
  memexAmount,
  baseEurAmount,
  totalEurAmount,
  feeMultiplier = 1.02,
}: PayPalSupportCheckoutProps) {
  // Default to the closest pack to the currently calculated EUR (if any)
  const defaultPackIndex = useMemo(() => {
    const current = Number.isFinite(baseEurAmount) && baseEurAmount > 0 ? baseEurAmount : 100;
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < PACKS.length; i++) {
      const d = Math.abs(PACKS[i].baseEur - current);
      if (d < bestDiff) {
        bestDiff = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [baseEurAmount]);

  const [packIndex, setPackIndex] = useState<number>(defaultPackIndex);

  const selectedBaseEur = PACKS[packIndex]?.baseEur ?? 100;
  const selectedTotalEur = Number((selectedBaseEur * feeMultiplier).toFixed(2));

  // Derive a stable conversion from the parent values (keeps your “fair” pricing logic)
  const memexPerEur = baseEurAmount > 0 ? memexAmount / baseEurAmount : 0;
  const solPerEur = baseEurAmount > 0 ? solAmount / baseEurAmount : 0;

  const derivedMemex = Math.floor(selectedBaseEur * memexPerEur);
  const derivedSol = Number((selectedBaseEur * solPerEur).toFixed(6));

  const canPay = Boolean(wallet);

  const createOrder = async (): Promise<string> => {
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet,
        level,
        // Use the selected pack-derived values
        solAmount: derivedSol,
        memexAmount: derivedMemex,
        baseEurAmount: selectedBaseEur,
        totalEurAmount: selectedTotalEur,
        feeMultiplier,
        // PayPal expects a string amount in many integrations
        amount: selectedTotalEur.toFixed(2),
        currency: 'EUR',
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('PayPal create-order error:', data);
      throw new Error('PayPal order creation failed');
    }

    const data = await res.json();
    if (!data?.orderID) throw new Error('No orderID returned');
    return data.orderID as string;
  };

  const captureOrder = async (orderID: string) => {
    const res = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderID,
        wallet,
        level,
        solAmount: derivedSol,
        memexAmount: derivedMemex,
        baseEurAmount: selectedBaseEur,
        totalEurAmount: selectedTotalEur,
        feeMultiplier,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('PayPal capture-order error:', data);
      throw new Error('PayPal capture failed');
    }

    return res.json();
  };

  const handlePayPal = async () => {
    try {
      const orderID = await createOrder();

      // NOTE:
      // Many PayPal flows require user approval before capture.
      // If your create-order route returns an approval/redirect URL,
      // redirect there instead of capturing immediately.
      await captureOrder(orderID);

      alert('PayPal payment successful! Your MEMEX is reserved.');
    } catch (e) {
      console.error(e);
      alert('PayPal payment failed. Please try again.');
    }
  };

  return (
    <div style={{ width: '100%', display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <label style={{ fontSize: 12, opacity: 0.9, letterSpacing: '0.06em' }}>
          Select your Support Pack
        </label>

        <select
          value={packIndex}
          onChange={(e) => setPackIndex(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(200,170,255,0.28)',
            background: 'rgba(17, 17, 34, 0.55)',
            color: '#fff',
            outline: 'none',
          }}
        >
          {PACKS.map((p, idx) => (
            <option key={p.baseEur} value={idx} style={{ color: '#000' }}>
              {p.label}
            </option>
          ))}
        </select>

        <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.35 }}>
          <div>
            Base: <strong>€{selectedBaseEur}</strong> · Processing fee included:{' '}
            <strong>{Math.round((feeMultiplier - 1) * 100)}%</strong>
          </div>
          <div>
            Total (charged): <strong>€{selectedTotalEur.toFixed(2)}</strong>
          </div>
          {derivedMemex > 0 && (
            <div>
              Estimated allocation: <strong>{derivedMemex.toLocaleString()} MEMEX</strong>
            </div>
          )}
        </div>
      </div>

      {!canPay && (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
          Please connect your wallet first so we can assign your MEMEX.
        </p>
      )}

      <button
        type="button"
        onClick={handlePayPal}
        disabled={!canPay}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 12,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: canPay ? 'pointer' : 'not-allowed',
          opacity: canPay ? 1 : 0.55,
          border: '1px solid rgba(255, 248, 210, 0.9)',
          background: 'linear-gradient(135deg, #ffd876, #ffb347)',
          boxShadow: '0 0 24px rgba(255, 215, 130, 0.55)',
        }}
      >
        Continue with PayPal
      </button>
    </div>
  );
}