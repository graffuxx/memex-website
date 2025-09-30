"use client";

const Hero = () => {
  const scrollToPresale = () => {
    const section = document.getElementById("presale-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-900 to-black text-white px-4">
      <h1 className="text-5xl font-bold mb-4 text-center">
        MemeX: Duelverse
      </h1>
      <p className="text-xl text-center max-w-xl mb-8">
        A meme-fueled trading card game powered by community-driven tokenomics.
      </p>
      <button
        onClick={scrollToPresale}
        className="bg-white text-black px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition"
      >
        Join the Presale
      </button>
    </section>
  );
};

export default Hero;