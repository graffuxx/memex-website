'use client';

import React, { useMemo, useState } from 'react';
import styles from './PayPalSupportCheckout.module.css';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

type Props = {
  walletAddress?: string | null;
};

type PackKey = 'rookie' | 'veteran' | 'pro' | 'over9000';

const PACKS: Record<PackKey, { label: string; eur: number }> = {
  rookie: { label: '€100 — Rookie Support', eur: 100 },
  veteran: { label: '€250 — Veteran Support', eur: 250 },
  pro: { label: '€500 — Pro Support', eur: 500 },
  over9000: { label: '€1000 — Over 9000! Support', eur: 1000 },
};

const FEE_RATE = 0.02;

function formatEUR(amount: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PayPalSupportCheckout({ walletAddress = null }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const [pack, setPack] = useState<PackKey>('rookie');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });

  const baseEur = PACKS[pack].eur;
  const feeEur = useMemo(() => Math.round(baseEur * FEE_RATE * 100) / 100, [baseEur]);
  const totalEur = useMemo(() => Math.round((baseEur + feeEur) * 100) / 100, [baseEur, feeEur]);

  const paypalOptions = useMemo(
    () => ({
      clientId: clientId || 'test',
      currency: 'EUR',
      intent: 'capture',
      components: 'buttons',
    }),
    [clientId]
  );

  const paypalReady = Boolean(clientId && clientId.trim().length > 10);

  return (
    <div className={styles.wrap}>
      <div className={styles.headRow}>
        <h3 className={styles.headTitle}>OR SUPPORT VIA PAYPAL</h3>

        <div className={styles.walletPill} title={walletAddress || 'Not connected'}>
          <span className={styles.walletDot} />
          <span className={styles.walletLabel}>WALLET</span>
          <span className={styles.walletValue}>
            {walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : 'Not connected'}
          </span>
        </div>
      </div>

      <div className={styles.panel}>
        {/* Dropdown sits ABOVE totals and never gets clipped */}
        <div className={styles.packColumn}>
          <select
            className={styles.select}
            value={pack}
            onChange={(e) => {
              setPack(e.target.value as PackKey);
              setStatus({ type: 'idle' });
            }}
            aria-label="Select support pack"
          >
            {Object.entries(PACKS).map(([key, v]) => (
              <option key={key} value={key}>
                {v.label}
              </option>
            ))}
          </select>

          <div className={styles.totalBox} aria-label="PayPal total">
            <div className={styles.totalLine}>
              <span>PACK</span>
              <span>{formatEUR(baseEur)}</span>
            </div>
            <div className={styles.totalLine}>
              <span>FEE (2%)</span>
              <span>{formatEUR(feeEur)}</span>
            </div>
            <div className={styles.totalDivider} />
            <div className={styles.totalLineStrong}>
              <span>TOTAL</span>
              <span>{formatEUR(totalEur)}</span>
            </div>
          </div>
        </div>

        {!paypalReady ? (
          <div className={styles.missing}>
            Missing <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> (set it in Vercel + local <strong>.env.local</strong>).
          </div>
        ) : (
          <div className={styles.paypalArea}>
            <PayPalScriptProvider options={paypalOptions}>
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  shape: 'pill',
                  label: 'pay',
                  height: 46,
                }}
                forceReRender={[pack, totalEur, walletAddress]}
                createOrder={async () => {
                  setStatus({ type: 'idle' });

                  const res = await fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      pack,
                      baseEur,
                      feeRate: FEE_RATE,
                      currency: 'EUR',
                      walletAddress,
                    }),
                  });

                  const data = await res.json().catch(() => ({}));

                  if (!res.ok) {
                    const msg = data?.error || data?.message || `PayPal create-order failed (${res.status})`;
                    throw new Error(msg);
                  }

                  const orderId = data?.id || data?.orderId || (typeof data === 'string' ? data : null);
                  if (!orderId) throw new Error('No order id returned from server.');
                  return orderId;
                }}
                onApprove={async (data) => {
                  const orderId =
                    (data as any)?.orderID ||
                    (data as any)?.orderId ||
                    (data as any)?.id ||
                    (data as any)?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

                  if (!orderId) {
                    setStatus({ type: 'error', message: 'No order id found on approval.' });
                    return;
                  }

                  const res = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      orderId,
                      walletAddress,
                      pack,
                      baseEur,
                      feeRate: FEE_RATE,
                      currency: 'EUR',
                    }),
                  });

                  const out = await res.json().catch(() => ({}));

                  if (!res.ok) {
                    const msg = out?.error || out?.message || `PayPal capture failed (${res.status})`;
                    setStatus({ type: 'error', message: msg });
                    return;
                  }

                  setStatus({ type: 'success', message: 'Payment successful! Your support has been recorded.' });
                }}
                onCancel={() => setStatus({ type: 'idle' })}
                onError={(err) =>
                  setStatus({
                    type: 'error',
                    message: (err as any)?.message || 'PayPal payment failed. Please try again.',
                  })
                }
              />
            </PayPalScriptProvider>

            {status.type === 'success' && <div className={styles.success}>{status.message}</div>}
            {status.type === 'error' && <div className={styles.error}>{status.message}</div>}
          </div>
        )}
      </div>
    </div>
  );
}