'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './PayPalSupportCheckout.module.css';

type Pack = {
  label: string;
  eur: number;
};

type Props = {
  walletAddress?: string | null;
};

const PACKS: Pack[] = [
  { label: '€100 — Rookie Support', eur: 100 },
  { label: '€250 — Veteran Support', eur: 250 },
  { label: '€500 — Pro Support', eur: 500 },
  { label: '€1000 — Over 9000! Support', eur: 1000 },
];

function loadPayPalSdk(clientId: string, currency = 'EUR') {
  return new Promise<void>((resolve, reject) => {
    // already loaded?
    // @ts-ignore
    if (typeof window !== 'undefined' && window.paypal) return resolve();

    const existing = document.getElementById('paypal-sdk');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('PayPal SDK load failed')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&currency=${encodeURIComponent(currency)}&intent=capture`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PayPal SDK load failed'));
    document.body.appendChild(script);
  });
}

export default function PayPalSupportCheckout({ walletAddress }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selectedPack = useMemo(() => PACKS[selectedIndex], [selectedIndex]);

  // Fee: +2%
  const totalEur = useMemo(() => {
    const base = selectedPack.eur;
    const withFee = base * 1.02;
    return Math.round(withFee * 100) / 100;
  }, [selectedPack]);

  useEffect(() => {
    let mounted = true;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setErr('Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID (set it in Vercel + local .env.local).');
      return;
    }

    loadPayPalSdk(clientId, 'EUR')
      .then(() => mounted && setSdkReady(true))
      .catch((e) => mounted && setErr(e?.message || 'PayPal SDK failed to load'));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sdkReady || !walletAddress) return;

    // @ts-ignore
    const paypal = window.paypal;
    if (!paypal?.Buttons) {
      setErr('PayPal Buttons not available (SDK not loaded correctly).');
      return;
    }

    const container = document.getElementById('paypal-buttons-container');
    if (!container) return;

    // clear old buttons (when pack changes)
    container.innerHTML = '';

    setErr(null);

    paypal
      .Buttons({
        style: {
          layout: 'vertical',
          shape: 'pill',
          label: 'paypal',
        },

        // ✅ THIS is the critical part: MUST return the STRING id from your API
        createOrder: async () => {
          setLoading(true);
          setErr(null);

          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eur: totalEur,
              packLabel: selectedPack.label,
              walletAddress: walletAddress || null,
            }),
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            setLoading(false);
            const msg =
              data?.error ||
              data?.message ||
              `Create order failed (${res.status})`;
            throw new Error(msg);
          }

          const orderId = data?.id; // ✅ your API returns { "id": "4XE..." }
          if (!orderId || typeof orderId !== 'string') {
            setLoading(false);
            throw new Error('Create order response missing id');
          }

          setLoading(false);
          return orderId; // ✅ MUST be returned
        },

        onApprove: async (data: any) => {
          try {
            setLoading(true);
            setErr(null);

            const orderId = data?.orderID;
            if (!orderId) throw new Error('Missing orderID from PayPal approval');

            const res = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                eur: totalEur,
                packLabel: selectedPack.label,
                walletAddress: walletAddress || null,
              }),
            });

            const out = await res.json().catch(() => ({}));

            if (!res.ok) {
              const msg =
                out?.error ||
                out?.message ||
                `Capture failed (${res.status})`;
              throw new Error(msg);
            }

            alert('✅ PayPal payment successful (Sandbox).');
          } catch (e: any) {
            alert(`PayPal payment failed: ${e?.message || 'Please try again.'}`);
          } finally {
            setLoading(false);
          }
        },

        onError: (e: any) => {
          setLoading(false);
          setErr(e?.message || 'PayPal error');
        },
      })
      .render('#paypal-buttons-container');
  }, [sdkReady, totalEur, selectedPack.label, walletAddress]);

  return (
    <div className={styles.paypalBox}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Or support easily via PayPal</h3>
        <div className={styles.sub}>
          PayPal total: <strong>€{totalEur.toFixed(2)}</strong> (incl. 2% processing fee)
        </div>
      </div>

      <label className={styles.label}>Select your support pack</label>
      <select
        className={styles.select}
        value={selectedIndex}
        onChange={(e) => setSelectedIndex(Number(e.target.value))}
        disabled={!sdkReady || loading}
      >
        {PACKS.map((p, idx) => (
          <option key={p.label} value={idx}>
            {p.label}
          </option>
        ))}
      </select>

      {!walletAddress && (
        <div className={styles.error}>
          Please connect your wallet first — your MEMEX allocation must be linked to a wallet address.
        </div>
      )}

      {err && <div className={styles.error}>{err}</div>}

      <div className={styles.paypalButtonsWrap}>
        {!sdkReady ? (
          <div className={styles.loading}>Loading PayPal…</div>
        ) : !walletAddress ? (
          <div className={styles.loading}>Connect wallet to continue…</div>
        ) : (
          <div id="paypal-buttons-container" />
        )}
      </div>

      <div className={styles.note}>
        Your MEMEX allocation will be linked to your wallet (claim later).
      </div>
    </div>
  );
}