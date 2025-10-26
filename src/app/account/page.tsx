"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import WalletButton from "@/components/WalletButton";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const { publicKey } = useWallet();
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (publicKey) {
      setIsLoggedIn(true);
    }
  }, [publicKey]);

  const handleEmailLogin = () => {
    if (email.includes("@")) {
      setIsLoggedIn(true);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Your Account</h1>

      {!isLoggedIn && (
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-xl mb-4">Connect Wallet or Login via Email</h2>

          <div className="mb-4">
            <WalletButton />
          </div>

          <div className="my-4 text-center text-gray-400">or</div>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded text-black"
          />
          <button
            onClick={handleEmailLogin}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Login via Email
          </button>
        </div>
      )}

      {isLoggedIn && (
        <div className="bg-gray-900 p-6 rounded shadow-md w-full max-w-2xl space-y-6">
          <h2 className="text-2xl font-semibold">Welcome!</h2>
          {publicKey && (
            <p>
              <strong>Wallet Address:</strong>{" "}
              <span className="break-all">{publicKey.toBase58()}</span>
            </p>
          )}
          {email && (
            <p>
              <strong>Email:</strong> {email}
            </p>
          )}

          {/* --- Presale Allocation Box --- */}
          <div className="bg-gray-800 p-4 rounded border border-purple-500">
            <h3 className="text-lg font-semibold mb-2">Presale Allocation</h3>
            <p>You have <strong>❌ 0 MEMEX</strong> reserved.</p>
            <p className="text-sm text-gray-400 mt-1">
              Tokens will be claimable here after the presale ends.
            </p>
          </div>

          {/* --- NFT Section Placeholder --- */}
          <div className="bg-gray-800 p-4 rounded border border-green-500">
            <h3 className="text-lg font-semibold mb-2">NFT Collection</h3>
            <p className="text-gray-300 italic">Coming Soon</p>
          </div>

          {/* --- Staking Placeholder --- */}
          <div className="bg-gray-800 p-4 rounded border border-blue-500">
            <h3 className="text-lg font-semibold mb-2">Staking Dashboard</h3>
            <p className="text-gray-300 italic">Coming Soon</p>
          </div>
        </div>
      )}
    </div>
  );
}