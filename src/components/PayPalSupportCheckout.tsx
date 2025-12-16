'use client';

import React from 'react';

type PayPalSupportCheckoutProps = {
  wallet: string | null;
  level: number;
  solAmount: number;
  memexAmount: number;
  baseEurAmount: number;
  totalEurAmount: number;
  feeMultiplier?: number; // defaults to 1.02
};

export default function PayPalSupportCheckout({
  wallet,
  level,
  solAmount,
  memexAmount,
  baseEurAmount,
  totalEurAmount,
  feeMultiplier = 1.02,
}: PayPalSupportCheckoutProps) {
  if (!wallet) {
    return (
      <p style={{ opacity: 0.85 }}>
        Please connect your wallet first so we can assign your MEMEX.
      </p>
    );
  }

  // NOTE:
  // This component assumes you already created the backend routes for:
  // - POST /api/paypal/create-order
  // - POST /api/paypal/capture-order
  //
  // If your endpoints have different paths, change them below.

  const createOrder = async (): Promise<string> => {
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet,
        level,
        solAmount,
        memexAmount,
        baseEurAmount,
        totalEurAmount,
        feeMultiplier,
        // PayPal expects a string amount in many integrations
        amount: totalEurAmount.toFixed(2),
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
        solAmount,
        memexAmount,
        baseEurAmount,
        totalEurAmount,
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

  // Minimal “button” that redirects/opens your PayPal flow (depends on how you implemented it).
  // If you use PayPal JS SDK Buttons, replace this block with your Buttons component.
  const handlePayPal = async () => {
    try {
      const orderID = await createOrder();

      // If your backend returns an approveUrl instead, then redirect to it.
      // Here we assume your integration uses the PayPal JS SDK on client OR you handle approval elsewhere.
      // If you have an approval link, do: window.location.href = data.approveUrl
      //
      // For now, we trigger capture directly only if your flow supports it (many flows require approval first).
      // So: adjust to your actual integration response shape.
      await captureOrder(orderID);

      alert('PayPal payment successful! Your MEMEX is reserved.');
    } catch (e) {
      console.error(e);
      alert('PayPal payment failed. Please try again.');
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayPal}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 12,
        fontWeight: 700,
        letterSpacing: '0.06em',
      }}
    >
      Continue with PayPal
    </button>
  );
}