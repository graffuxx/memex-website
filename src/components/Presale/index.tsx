"use client";

import { useRef } from "react";

const Presale = () => {
  const formRef = useRef(null);

  return (
    <section
      id="presale-section"
      className="w-full py-24 px-6 bg-black text-white flex flex-col items-center"
    >
      <div className="max-w-3xl w-full text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Join the MemeX Presale</h2>
        <p className="text-lg text-gray-300">
          Be part of a community-driven revolution. Reserve your $MEMEX tokens before launch
          and help fund the development of the MemeX: Duelverse game.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          From the community, for the community.
        </p>
      </div>

      <div className="w-full max-w-xl bg-gray-900 p-6 rounded-lg shadow-lg">
        <p className="text-gray-400 text-center mb-4">
          Presale form coming soon – connect your wallet to participate.
        </p>
        <div className="bg-gray-800 text-center py-6 rounded border border-gray-700">
          🔒 Wallet Connect & Token Purchase Form Placeholder
        </div>
      </div>
    </section>
  );
};

export default Presale;