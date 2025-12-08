import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=eur',
      { cache: 'no-store' }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch price');
    }

    const data = await res.json();

    return NextResponse.json({
      eur: data.solana.eur,
    });
  } catch (err) {
    console.error('CoinGecko price error:', err);

    // Fallback Preis (falls API down)
    return NextResponse.json({
      eur: 110.0,
      fallback: true,
    });
  }
}