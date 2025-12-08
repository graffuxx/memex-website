'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./TickerBar.module.css";

const hypeMessages = [
  "🔥 Presale starts December 20 — Level 1 opens!",
  "🎁 Random NFT drops incoming!",
  "🚀 Big things are coming — the Duelverse awakens!",
  "💎 Level 1 = Best MEMEX rates!",
  "⚔️ Prepare your wallet — the Duelverse begins!",
  "📈 MEMEX Presale — huge early interest!",
  "🔥 Limited supply per level — don’t miss out!",
  "🎉 Live purchases will appear here during presale!",
];

export default function NewsBar() {
  const [message, setMessage] = useState(hypeMessages[0]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Rotating hype text
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % hypeMessages.length);
      setMessage(hypeMessages[(index + 1) % hypeMessages.length]);
    }, 4500);

    return () => clearInterval(interval);
  }, [index]);

  const [liveBuy, setLiveBuy] = useState<string | null>(null);

  // SUPABASE REALTIME: Listen to new presale_orders
  useEffect(() => {
    const channel = supabase
      .channel("memex-buy-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "presale_orders" },
        (payload) => {
          const data = payload.new;

          const shortWallet =
            data.wallet.slice(0, 4) + "..." + data.wallet.slice(-4);

          const msg = `💰 ${shortWallet} just bought ${Number(
            data.memex_amount
          ).toLocaleString()} MEMEX`;

          setLiveBuy(msg);

          // Fades out after 6 sec
          setTimeout(() => setLiveBuy(null), 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className={styles.newsBar}>
      {/* LIVE BUY EVENT HAS PRIORITY */}
      {liveBuy ? (
        <span className={styles.liveBuy}>{liveBuy}</span>
      ) : (
        <span className={styles.text}>{message}</span>
      )}
    </div>
  );
}