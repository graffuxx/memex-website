export default function HeroSection() {
  return (
    <section className="relative w-full h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-b from-[#0f0f1f] to-[#1a1a2e] text-white px-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Power to the Meme. <br />
          Strength to the Player.
        </h1>
        <p className="text-lg md:text-xl mb-6 text-gray-300">
          MemeX is the ultimate Web3 trading card game where memes meet strategy. <br />
          Join the presale and claim your place in the Duelverse.
        </p>
        <a
          href="/presale"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Join Presale
        </a>
      </div>
    </section>
  );
}