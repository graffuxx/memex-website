"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark text-light font-retro px-4 py-10">
      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center gap-6 py-16">
        <Image
          src="/memexlogo.jpg"
          alt="MemeX Logo"
          width={180}
          height={180}
          className="rounded-full shadow-lg border border-bluex"
        />
        <h1 className="text-4xl md:text-6xl font-bold text-glow drop-shadow-[0_0_10px_#898CFF]">
          MemeX Duelverse
        </h1>
        <p className="text-gray-300 max-w-2xl text-sm md:text-base">
          The next-generation Web3 trading card game. Fueled by memes. Built by the community.
        </p>
        <Link
          href="/presale"
          className="mt-4 inline-block bg-bluex text-black px-6 py-3 rounded-lg text-sm font-semibold hover:bg-memex transition"
        >
          🚀 Join the Presale
        </Link>
      </section>

      {/* FEATURE GRID */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        {[
          {
            title: "Collect Meme Cards",
            desc: "Unlock rare, animated NFTs and dominate the duelverse.",
            emoji: "🃏",
          },
          {
            title: "Stake & Earn",
            desc: "Put your $MEMEX to work and farm booster packs.",
            emoji: "💰",
          },
          {
            title: "Community-Powered",
            desc: "70% of tokens go to the players. Built for you.",
            emoji: "🤝",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-[#121212] border border-bluex/30 rounded-xl p-6 text-left hover:shadow-[0_0_20px_#898CFF] transition-shadow duration-300"
          >
            <h3 className="text-lg mb-2 text-glow">{item.emoji} {item.title}</h3>
            <p className="text-sm text-gray-400">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="bg-black bg-opacity-80 py-6 text-center text-xs text-gray-500 border-t border-gray-800 mt-16">
        <p>
          &copy; {new Date().getFullYear()} MemeX Duelverse. All rights reserved.
        </p>
        <div className="mt-2 flex justify-center gap-4 text-glow text-xs">
          <Link href="/whitepaper" className="hover:underline">Whitepaper</Link>
          <Link href="/faq" className="hover:underline">FAQ</Link>
          <Link href="/social-media" className="hover:underline">Socials</Link>
          <Link href="/account" className="hover:underline">Account</Link>
        </div>
      </footer>
    </main>
  );
}