'use client';

import React, { useMemo, useState } from 'react';
import styles from './PayPalSupportCheckout.module.css';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

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

export default function PayPalSupportCheckout({ walletAddress = null }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''; // <- exakt dieser Name
  const [packId, setPackId] = useState<Pack['id']>('rookie');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const selectedPack = useMemo(() => PACKS.find((p) => p.id === packId)!, [packId]);

  // 2% Fee on top
  const feeRate = 0.02;
  const feeEUR = round2(selectedPack.baseEUR * feeRate);
  const totalEUR = round2(selectedPack.baseEUR + feeEUR);

  const canPay = Boolean(clientId) && Boolean(selectedPack) && !busy;

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
        <div className={styles.metaLineSmall}>
          Your MEMEX allocation will be linked to your wallet (claim later).
        </div>
      </div>

      {/* Status / Errors (kein doppelter Text, kein Chaos) */}
      {!!msg && <div className={styles.message}>{msg}</div>}

      {!clientId ? (
        <div className={styles.missingKey}>
          Missing <b>NEXT_PUBLIC_PAYPAL_CLIENT_ID</b> (set it in Vercel + local <b>.env.local</b>).
        </div>
      ) : (
        <PayPalScriptProvider
          options={{
            clientId,
            currency: 'EUR',
            intent: 'capture',
          }}
        >
          <div className={styles.buttonWrap}>
            {/* Goldener “Button”-Look bleibt immer gleich – das SDK rendert innen, wir stylen außen */}
            <div className={`${styles.paypalFrame} ${!canPay ? styles.disabled : ''}`}>
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  label: 'pay',
                }}
                disabled={!canPay}
                forceReRender={[totalEUR, packId, walletAddress]}
                createOrder={async (): Promise<string> => {
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
                    if (!res.ok) {
                      throw new Error(data?.error || `Create order failed (${res.status})`);
                    }
                    if (!data?.id) {
                      throw new Error('No order id returned from create-order.');
                    }

                    return String(data.id);
                  } catch (e: any) {
                    setMsg(`PayPal payment failed: ${e?.message || 'Please try again.'}`);
                    throw e;
                  } finally {
                    setBusy(false);
                  }
                }}
                onApprove={async (data: any) => {
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
                }}
                onError={(err: any) => {
                  setMsg('PayPal payment failed. Please try again.');
                  console.error('[paypal] buttons error', err);
                }}
              />
            </div>
          </div>
        </PayPalScriptProvider>
      )}

      <div className={styles.footerNote}>
        Payments are processed securely via PayPal. MEMEX will be claimable after the presale.
      </div>
    </div>
  );
}