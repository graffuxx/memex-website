export default function HomePage() {
  return (
    <div className="text-center space-y-8">
      {/* 🔘 Logo */}
      <div className="flex justify-center">
        <img
          src="/memexlogo.jpg"
          alt="MemeX Logo"
          className="h-40 w-40 rounded-full shadow-xl border-4 border-bluex"
        />
      </div>

      {/* ✨ Headline */}
      <h1 className="text-4xl font-retro text-glow">MemeX Duelverse</h1>
      <p className="text-lg text-light">
        The next-generation Web3 trading card game. Fueled by memes. Built by the community.
      </p>

      {/* 🚀 Call-to-Action */}
      <a
        href="/presale"
        className="inline-block px-6 py-3 bg-bluex text-black rounded-lg shadow-md hover:scale-105 transition transform duration-200 font-bold"
      >
        🚀 Join the Presale
      </a>

      {/* 🎮 Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <div className="bg-dark border border-glow p-4 rounded-lg">
          <h3 className="font-bold text-light text-lg mb-2">🃏 Collect Meme Cards</h3>
          <p className="text-sm text-light">Unlock rare, animated NFTs and dominate the duelverse.</p>
        </div>
        <div className="bg-dark border border-glow p-4 rounded-lg">
          <h3 className="font-bold text-light text-lg mb-2">💰 Stake & Earn</h3>
          <p className="text-sm text-light">Put your $MEMEX to work and farm booster packs.</p>
        </div>
        <div className="bg-dark border border-glow p-4 rounded-lg">
          <h3 className="font-bold text-light text-lg mb-2">🤝 Community-Powered</h3>
          <p className="text-sm text-light">70% of tokens go to the players. Built for you.</p>
        </div>
      </div>
    </div>
  );
}