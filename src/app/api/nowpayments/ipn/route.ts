import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabaseClient";

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;

  const hmac = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  return hmac === signature.toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!ipnSecret) {
      console.error("NOWPAYMENTS_IPN_SECRET missing");
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const rawBody = await req.text();
    const sigHeader = req.headers.get("x-nowpayments-sig");

    if (!verifySignature(rawBody, sigHeader, ipnSecret)) {
      console.error("NOWPayments IPN: invalid signature");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch {
      console.error("NOWPayments IPN: invalid JSON body");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const paymentId = data.payment_id ? String(data.payment_id) : null;
    const paymentStatus = data.payment_status?.toString();
    const priceAmount = Number(data.price_amount ?? 0);
    const priceCurrency = data.price_currency ?? null;
    const orderIdRaw = data.order_id || null;

    if (!paymentId) {
      console.error("NOWPayments IPN without payment_id:", data);
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    let meta: any = {};
    if (orderIdRaw) {
      try {
        meta = JSON.parse(orderIdRaw);
      } catch {
        console.warn("Could not parse order_id JSON, value:", orderIdRaw);
      }
    }

    const wallet: string | null = meta.wallet ?? null;
    const level: number | null = meta.level ?? null;
    const memexAmount: number | null = meta.memexAmount ?? null;
    const solAmount: number | null = meta.solAmount ?? null;
    const eurAmount: number | null = meta.eurAmount ?? priceAmount;

    const { data: existing, error: selectError } = await supabase
      .from("presale_orders")
      .select("id")
      .eq("payment_id", paymentId)
      .limit(1);

    if (selectError) {
      console.error("Supabase select error (presale_orders):", selectError);
    }

    if (!existing || existing.length === 0) {
      const { error: insertError } = await supabase
        .from("presale_orders")
        .insert({
          wallet,
          sol_amount: solAmount,
          memex_amount: memexAmount,
          level,
          tx_hash: null,
          payment_method: "nowpayments_creditcard",
          payment_provider: "nowpayments",
          fiat_amount: eurAmount,
          fiat_currency: priceCurrency,
          payment_id: paymentId,
          payment_status: paymentStatus,
        });

      if (insertError) {
        console.error("Supabase insert error (presale_orders):", insertError);
      }
    } else {
      const { error: updateError } = await supabase
        .from("presale_orders")
        .update({
          payment_status: paymentStatus,
          fiat_amount: eurAmount,
          fiat_currency: priceCurrency,
        })
        .eq("payment_id", paymentId);

      if (updateError) {
        console.error("Supabase update error (presale_orders):", updateError);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Error in NOWPayments IPN route:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}#