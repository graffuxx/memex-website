import { NextResponse } from 'next/server';

// Ensure Node.js runtime (Buffer, etc.)
export const runtime = 'nodejs';

const PACK_MAP: Record<string, number> = {
  rookie: 100,
  veteran: 250,
  pro: 500,
  over9000: 1000,
};

const PAYPAL_FEE_MULTIPLIER = 1.02; // +2% fee

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
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error_description || json?.error || 'PayPal auth failed';
    throw new Error(msg);
  }

  return { base, token: json.access_token as string };
}

async function getSolEur() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=eur',
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to load SOL price');

  const json = await res.json().catch(() => null);
  const price = json?.solana?.eur;
  if (!price || typeof price !== 'number') throw new Error('Invalid SOL price');

  return price as number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const packKey = body?.packKey;

    if (typeof packKey !== 'string' || !packKey.trim()) {
      return NextResponse.json({ error: 'Missing packKey' }, { status: 400 });
    }

    const eurBase = PACK_MAP[packKey];
    if (!eurBase) {
      return NextResponse.json({ error: 'Invalid packKey' }, { status: 400 });
    }

    // +2% fee on top (buyer pays it)
    const eurCharged = Number((eurBase * PAYPAL_FEE_MULTIPLIER).toFixed(2));

    const solEur = await getSolEur();

    // TODO: Replace with your real current level rate (MEMEX per SOL).
    // Mirror PresaleOverview logic here so server stays the source of truth.
    const memexPerSol = 1_000_000; // placeholder

    const solEquivalent = eurBase / solEur;
    const memexAmount = solEquivalent * memexPerSol;

    const { base, token } = await getAccessToken();

    const solEurFixed = Number(solEur.toFixed(2));
    const solEqFixed = Number(solEquivalent.toFixed(8));
    const memexFixed = Math.round(memexAmount);

    // PayPal `custom_id` is length-limited; keep it compact.
    // Format: p=<pack>|e=<eur>|s=<solEur>|q=<solEq>|m=<memex>
    const custom_id = `p=${packKey}|e=${eurBase}|s=${solEurFixed}|q=${solEqFixed}|m=${memexFixed}`;

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: `MemeX Duelverse Support Pack: ${packKey}`,
            custom_id,
            amount: {
              currency_code: 'EUR',
              value: eurCharged.toFixed(2),
            },
          },
        ],
      }),
      cache: 'no-store',
    });

    const orderJson = await orderRes.json().catch(() => null);
    if (!orderRes.ok) {
      const detailsDesc = Array.isArray(orderJson?.details)
        ? orderJson.details.map((d: any) => d?.description).filter(Boolean).join(' | ')
        : '';

      const message =
        detailsDesc ||
        orderJson?.message ||
        orderJson?.name ||
        orderJson?.error_description ||
        'PayPal create order failed';

      return NextResponse.json(
        { error: message, raw: orderJson },
        { status: orderRes.status || 500 }
      );
    }

    return NextResponse.json({ id: orderJson.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}