import { NextRequest, NextResponse } from "next/server";

const NP_SANDBOX_URL = "https://api-sandbox.nowpayments.io/v1";
const NP_LIVE_URL = "https://api.nowpayments.io/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      wallet,       // string: Solana Wallet (Pflicht)
      level,        // number: Presale-Level
      memexAmount,  // number: MEMEX-Menge
      solAmount,    // number: SOL-Equivalent (optional)
      eurAmount,    // number: EUR-Betrag
      email,        // optional: Kontakt-E-Mail
    } = body;

    if (!wallet || !level || !memexAmount || !eurAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      console.error("NOWPAYMENTS_API_KEY is missing");
      return NextResponse.json(
        { error: "Server payment configuration error" },
        { status: 500 }
      );
    }

    const envSandbox = process.env.NOWPAYMENTS_SANDBOX === "true";
    const baseUrl = envSandbox ? NP_SANDBOX_URL : NP_LIVE_URL;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://memexduelverse.com";

    const orderMeta = {
      wallet,
      level,
      memexAmount,
      solAmount,
      eurAmount,
      email,
      source: "memex_presale",
    };

    const resNp = await fetch(`${baseUrl}/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        price_amount: eurAmount,
        price_currency: "eur",
        ipn_callback_url: `${siteUrl}/api/presale/nowpayments/ipn`,
        order_id: JSON.stringify(orderMeta),
        order_description: `MemeX Presale Level ${level} – ${memexAmount} MEMEX`,
      }),
    });

    if (!resNp.ok) {
      const text = await resNp.text();
      console.error("NOWPayments create invoice failed:", text);
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500 }
      );
    }

    const data = await resNp.json();

    const invoiceUrl = data.invoice_url as string | undefined;

    if (!invoiceUrl) {
      console.error("Missing invoice_url in NOWPayments response:", data);
      return NextResponse.json(
        { error: "No invoice URL returned" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        invoiceUrl,
        invoiceId: data.id ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in create-invoice route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}