export default function Hero() {
  return (
    <section className="glow-box mt-12 text-center space-y-6">
      <div className="w-full h-[300px] bg-gradient-to-b from-memex-accent/10 to-transparent rounded-xl flex items-center justify-center">
        <span className="text-memex-accent text-2xl italic">[ Hero Artwork Placeholder ]</span>
      </div>

      <h1 className="text-5xl font-bold text-memex-primary drop-shadow-md">
        MemeX – Duelverse
      </h1>
      <p className="text-lg text-white/80 max-w-xl mx-auto">
        The ultimate meme-powered Web3 trading card experience. Collect, stake & dominate the Duelverse.
      </p>
      <a
        href="/presale"
        className="bg-memex-primary text-black font-semibold px-6 py-3 rounded-xl shadow-glow hover:scale-105 transition"
      >
        Join the Presale
      </a>
    </section>
  )
}