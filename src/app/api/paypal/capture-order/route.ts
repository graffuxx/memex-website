import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure Node.js runtime (Buffer, etc.)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getPaypalEnv() {
  const env = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
  const base =
    env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  return { env, base };
}

async function getAccessToken() {
  const { base } = getPaypalEnv();

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    // Avoid caching tokens at the edge
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error_description || json?.error || 'PayPal auth failed';
    throw new Error(msg);
  }

  return { base, token: json.access_token as string };
}

function parseMeta(customId: unknown) {
  if (typeof customId !== 'string' || !customId.trim()) return null;
  try {
    return JSON.parse(customId);
  } catch {
    return { raw: customId };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Accept multiple client payload shapes
    const orderId =
      (typeof body?.orderId === 'string' && body.orderId) ||
      (typeof body?.orderID === 'string' && body.orderID) ||
      (typeof body?.id === 'string' && body.id) ||
      '';

    if (!orderId.trim()) {
      return NextResponse.json(
        { error: 'Missing orderId (expected orderId/orderID/id)' },
        { status: 400 }
      );
    }

    const { base, token } = await getAccessToken();

    const capRes = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const capJson = await capRes.json().catch(() => null);

    if (!capRes.ok) {
      // PayPal often returns { name, message, details: [...] }
      const message =
        capJson?.message ||
        capJson?.name ||
        (Array.isArray(capJson?.details) && capJson.details[0]?.description) ||
        'PayPal capture failed';

      return NextResponse.json(
        { error: message, raw: capJson },
        { status: 500 }
      );
    }

    // Usually COMPLETED means payment is captured.
    // (Some flows can return APPROVED/PAYER_ACTION_REQUIRED etc.)
    const status = capJson?.status;
    if (status && status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `PayPal capture not completed (status: ${status})`, raw: capJson },
        { status: 400 }
      );
    }

    const purchaseUnit = capJson?.purchase_units?.[0];
    const meta = parseMeta(purchaseUnit?.custom_id);

    const walletAddress =
      typeof body?.walletAddress === 'string' ? body.walletAddress : null;
    const packKeyFromBody =
      typeof body?.packKey === 'string'
        ? body.packKey
        : typeof body?.pack === 'string'
          ? body.pack
          : null;
    const baseEurFromBody =
      typeof body?.baseEur === 'number'
        ? body.baseEur
        : typeof body?.baseEur === 'string'
          ? Number(body.baseEur)
          : null;
    const feeRateFromBody =
      typeof body?.feeRate === 'number'
        ? body.feeRate
        : typeof body?.feeRate === 'string'
          ? Number(body.feeRate)
          : null;

    const capture = purchaseUnit?.payments?.captures?.[0];
    const amountEur = capture?.amount?.value;
    const captureId = capture?.id;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRole) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole, {
      auth: { persistSession: false },
    });

    // NOTE: Ensure `paypal_orders.paypal_order_id` is UNIQUE in Supabase.
    // Upsert makes the capture idempotent (refresh / double-click safe).
    const payload = {
      paypal_order_id: orderId,
      paypal_capture_id: captureId || null,
      amount_eur:
        amountEur ? Number(amountEur) : meta?.eur ?? baseEurFromBody ?? null,
      pack_key: meta?.packKey ?? packKeyFromBody ?? null,
      wallet_address: meta?.walletAddress ?? walletAddress ?? null,
      processing_fee_rate: meta?.feeRate ?? feeRateFromBody ?? null,
      sol_price_eur_used: meta?.solEur || null,
      sol_equivalent: meta?.solEquivalent || null,
      memex_amount: meta?.memexAmount || null,
      status: status || 'CAPTURED',
      raw: capJson,
    };

    const { error } = await supabase
      .from('paypal_orders')
      .upsert([payload], { onConflict: 'paypal_order_id' });

    if (error) {
      return NextResponse.json(
        { error: `Supabase upsert failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId,
      orderID: orderId,
      captureId: captureId || null,
      amountEur: amountEur ? Number(amountEur) : null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}