'use client';

import React, { useMemo, useState } from 'react';
import styles from './PayPalSupportCheckout.module.css';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

type Props = {
  walletAddress?: string | null;
};

type PackKey = 'rookie' | 'veteran' | 'pro' | 'over9000';

const PACKS: Record<
  PackKey,
  { label: string; eur: number; subtitle: string }
> = {
  rookie: { label: '€100 — Rookie Support', eur: 100, subtitle: 'Get started & support the Duelverse' },
  veteran: { label: '€250 — Veteran Support', eur: 250, subtitle: 'Serious supporter energy' },
  pro: { label: '€500 — Pro Support', eur: 500, subtitle: 'Pro-tier boost for development' },
  over9000: { label: '€1000 — Over 9000! Support', eur: 1000, subtitle: 'Legendary backer status' },
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
  const [status, setStatus] = useState<
    { type: 'idle' | 'success' | 'error'; message?: string }
  >({ type: 'idle' });

  const baseEur = PACKS[pack].eur;
  const feeEur = useMemo(() => Math.round(baseEur * FEE_RATE * 100) / 100, [baseEur]);
  const totalEur = useMemo(() => Math.round((baseEur + feeEur) * 100) / 100, [baseEur, feeEur]);

  const paypalOptions = useMemo(
    () => ({
      clientId: clientId || 'test', // verhindert Crash im Dev-UI, echte Buttons brauchen echten clientId
      currency: 'EUR',
      intent: 'CAPTURE' as const,
      components: 'buttons',
    }),
    [clientId]
  );

  // Wenn Client-ID fehlt: UI zeigen, aber keine PayPal Buttons laden
  const paypalReady = Boolean(clientId && clientId.trim().length > 10);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>Or support via PayPal</div>
        <div className={styles.subtitle}>
          Choose a support package and complete checkout with PayPal. Your MEMEX allocation will be linked to your connected wallet.
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.rowTop}>
          <div className={styles.selectWrap}>
            <label className={styles.label}>Select your support pack</label>
            <select
              className={styles.select}
              value={pack}
              onChange={(e) => {
                setPack(e.target.value as PackKey);
                setStatus({ type: 'idle' });
              }}
            >
              {Object.entries(PACKS).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.label}
                </option>
              ))}
            </select>
            <div className={styles.hint}>{PACKS[pack].subtitle}</div>
          </div>

          <div className={styles.totalBox}>
            <div className={styles.totalLine}>
              <span>Pack</span>
              <span>{formatEUR(baseEur)}</span>
            </div>
            <div className={styles.totalLine}>
              <span>Processing (2%)</span>
              <span>{formatEUR(feeEur)}</span>
            </div>
            <div className={styles.totalDivider} />
            <div className={styles.totalLineStrong}>
              <span>Total</span>
              <span>{formatEUR(totalEur)}</span>
            </div>
          </div>
        </div>

        <div className={styles.walletInfo}>
          <div className={styles.walletPill}>
            <span className={styles.walletDot} />
            <span className={styles.walletLabel}>Wallet:</span>
            <span className={styles.walletValue}>
              {walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : 'Not connected'}
            </span>
          </div>
          <div className={styles.smallNote}>
            MEMEX will be <strong>claimable after the presale</strong>. Payments are processed securely via PayPal.
          </div>
        </div>

        {!paypalReady ? (
          <div className={styles.missing}>
            Missing <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>. Set it in <strong>Vercel</strong> and your local <strong>.env.local</strong>, then redeploy/restart.
          </div>
        ) : (
          <div className={styles.paypalArea}>
            <PayPalScriptProvider options={paypalOptions}>
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  shape: 'pill',
                  label: 'pay',
                  height: 44,
                }}
                forceReRender={[pack, totalEur, walletAddress]}
                disabled={false}
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
                    const msg =
                      data?.error ||
                      data?.message ||
                      `PayPal create-order failed (${res.status})`;
                    throw new Error(msg);
                  }

                  // akzeptiere mehrere Shapes: {id} oder {orderId} oder string
                  const orderId =
                    data?.id || data?.orderId || (typeof data === 'string' ? data : null);

                  if (!orderId) throw new Error('No order id returned from server.');
                  return orderId;
                }}
                onApprove={async (data) => {
                  const orderId = (data as any)?.orderID;
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
                    const msg =
                      out?.error ||
                      out?.message ||
                      `PayPal capture failed (${res.status})`;
                    setStatus({ type: 'error', message: msg });
                    return;
                  }

                  setStatus({
                    type: 'success',
                    message: 'Payment successful! Your support has been recorded.',
                  });
                }}
                onCancel={() => {
                  setStatus({ type: 'error', message: 'Payment cancelled.' });
                }}
                onError={(err) => {
                  setStatus({
                    type: 'error',
                    message:
                      (err as any)?.message ||
                      'PayPal payment failed. Please try again.',
                  });
                }}
              />
            </PayPalScriptProvider>

            {status.type === 'success' && (
              <div className={styles.success}>{status.message}</div>
            )}
            {status.type === 'error' && (
              <div className={styles.error}>{status.message}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}