'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './PayPalSupportCheckout.module.css';

type Props = {
  walletAddress?: string | null;
};

type Pack = {
  id: 'rookie' | 'veteran' | 'pro' | 'over9000';
  label: string;
  baseEUR: number;
};

const PACKS: Pack[] = [
  { id: 'rookie', label: '€100 — Rookie Support', baseEUR: 100 },
  { id: 'veteran', label: '€250 — Veteran Support', baseEUR: 250 },
  { id: 'pro', label: '€500 — Pro Support', baseEUR: 500 },
  { id: 'over9000', label: '€1000 — Over 9000! Support', baseEUR: 1000 },
];

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

function usePayPalSDK(clientId: string, currency: string) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!clientId) {
      setReady(false);
      setError('');
      return;
    }

    // If already loaded
    if (typeof window !== 'undefined' && window.paypal?.Buttons) {
      setReady(true);
      setError('');
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-paypal-sdk="true"]');
    if (existing) {
      const onLoad = () => setReady(true);
      const onErr = () => setError('PayPal SDK failed to load.');
      existing.addEventListener('load', onLoad);
      existing.addEventListener('error', onErr);
      return () => {
        existing.removeEventListener('load', onLoad);
        existing.removeEventListener('error', onErr);
      };
    }

    setReady(false);
    setError('');

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-paypal-sdk', 'true');

    script.onload = () => setReady(true);
    script.onerror = () => setError('PayPal SDK failed to load.');

    document.body.appendChild(script);

    return () => {
      // do not remove script on unmount (keeps SPA stable)
    };
  }, [clientId, currency]);

  return { ready, error };
}

export default function PayPalSupportCheckout({ walletAddress = null }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  const [packId, setPackId] = useState<Pack['id']>('rookie');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const selectedPack = useMemo(() => PACKS.find((p) => p.id === packId)!, [packId]);

  // 2% Fee on top
  const feeRate = 0.02;
  const feeEUR = round2(selectedPack.baseEUR * feeRate);
  const totalEUR = round2(selectedPack.baseEUR + feeEUR);

  const canPay = Boolean(clientId) && !busy;

  const { ready: sdkReady, error: sdkError } = usePayPalSDK(clientId, 'EUR');

  const buttonsRef = useRef<HTMLDivElement | null>(null);

  // Render/refresh PayPal Buttons into our gold frame
  useEffect(() => {
    if (!clientId) return;
    if (!sdkReady) return;
    if (!buttonsRef.current) return;
    if (!window.paypal?.Buttons) return;

    // Clear previous render
    buttonsRef.current.innerHTML = '';

    try {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'pill',
            label: 'pay',
            tagline: false,
          },
          onClick: () => {
            setMsg('');
          },
          createOrder: async () => {
            setMsg('');
            setBusy(true);
            try {
              const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  amount: totalEUR.toFixed(2),
                  currency: 'EUR',
                  packId,
                  walletAddress,
                  baseAmount: selectedPack.baseEUR.toFixed(2),
                  feeAmount: feeEUR.toFixed(2),
                }),
              });

              const data = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(data?.error || `Create order failed (${res.status})`);
              if (!data?.id) throw new Error('No order id returned from create-order.');

              return String(data.id);
            } finally {
              setBusy(false);
            }
          },
          onApprove: async (data: any) => {
            setMsg('');
            setBusy(true);
            try {
              const orderID = data?.orderID;
              if (!orderID) throw new Error('No orderID in onApprove.');

              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderID,
                  packId,
                  walletAddress,
                  amount: totalEUR.toFixed(2),
                  currency: 'EUR',
                }),
              });

              const out = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(out?.error || `Capture failed (${res.status})`);

              setMsg('✅ PayPal payment completed (sandbox). Allocation will be logged & claimable later.');
            } catch (e: any) {
              setMsg(`PayPal capture failed: ${e?.message || 'Please try again.'}`);
            } finally {
              setBusy(false);
            }
          },
          onError: (err: any) => {
            console.error('[paypal] buttons error', err);
            setMsg('PayPal payment failed. Please try again.');
            setBusy(false);
          },
        })
        .render(buttonsRef.current);
    } catch (e) {
      console.error('[paypal] render error', e);
      setMsg('PayPal could not be initialized.');
    }
  }, [clientId, sdkReady, totalEUR, packId, walletAddress, selectedPack.baseEUR, feeEUR]);

  return (
    <div className={styles.wrap}>
      <div className={styles.headRow}>
        <div className={styles.title}>OR SUPPORT EASILY VIA PAYPAL</div>
        <div className={styles.sub}>
          PayPal total: <b>€{totalEUR.toFixed(2)}</b> (incl. 2% processing fee)
        </div>
      </div>

      <label className={styles.label}>Select your support pack</label>
      <select
        className={styles.select}
        value={packId}
        onChange={(e) => setPackId(e.target.value as Pack['id'])}
        disabled={busy}
      >
        {PACKS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      <div className={styles.meta}>
        <div className={styles.metaLine}>
          Base: <b>€{selectedPack.baseEUR.toFixed(2)}</b> · Fee: <b>€{feeEUR.toFixed(2)}</b>
        </div>
        <div className={styles.metaLineSmall}>Your MEMEX allocation will be linked to your wallet (claim later).</div>
      </div>

      {!!msg && <div className={styles.message}>{msg}</div>}

      {!clientId ? (
        <div className={styles.missingKey}>
          Missing <b>NEXT_PUBLIC_PAYPAL_CLIENT_ID</b> (set it in Vercel + local <b>.env.local</b>).
        </div>
      ) : (
        <div className={styles.buttonWrap}>
          <div className={`${styles.paypalFrame} ${!canPay ? styles.disabled : ''}`}>
            {!sdkReady && !sdkError && <div className={styles.loading}>Loading PayPal…</div>}
            {!!sdkError && <div className={styles.message}>{sdkError}</div>}
            <div ref={buttonsRef} />
          </div>
        </div>
      )}

      <div className={styles.footerNote}>
        Payments are processed securely via PayPal. MEMEX will be claimable after the presale.
      </div>
    </div>
  );
}