import WalletButton from "@/components/WalletButton";
import { useMemo } from "react";

const presaleLevels = [
  { level: 1, total: 1_000_000_000, sold: 1_000_000_000, rate: 500_000 },
  { level: 2, total: 1_000_000_000, sold: 820_000_000, rate: 450_000 },
  { level: 3, total: 1_000_000_000, sold: 0, rate: 400_000 },
  { level: 4, total: 1_000_000_000, sold: 0, rate: 350_000 },
  { level: 5, total: 1_000_000_000, sold: 0, rate: 300_000 },
  { level: 6, total: 1_000_000_000, sold: 0, rate: 250_000 },
  { level: 7, total: 1_000_000_000, sold: 0, rate: 200_000 },
  { level: 8, total: 1_000_000_000, sold: 0, rate: 150_000 },
  { level: 9, total: 1_000_000_000, sold: 0, rate: 100_000 },
  { level: 10, total: 1_600_000_000, sold: 0, rate: 60_000 },
];

export default function PresalePage() {
  const currentLevel = useMemo(() => presaleLevels.find((l) => l.sold < l.total), []);
  const currentIndex = presaleLevels.findIndex((l) => l === currentLevel);
  const previousLevel = presaleLevels[currentIndex - 1];
  const nextLevel = presaleLevels[currentIndex + 1];

  const renderLevelCard = (level, type) => {
    const progress = (level.sold / level.total) * 100;
    const baseClasses =
      "rounded-xl p-4 transition duration-500 shadow-md flex flex-col justify-between text-white";

    switch (type) {
      case "past":
        return (
          <div
            key={level.level}
            className={`${baseClasses} bg-gray-900 border border-red-400 text-red-400 opacity-60`}
          >
            <h3 className="text-xl font-bold">Level {level.level}</h3>
            <p className="text-red-400">Sold Out</p>
            <div className="h-2 bg-red-400 w-full rounded-full mt-2" />
          </div>
        );
      case "current":
        return (
          <div
            key={level.level}
            className={`${baseClasses} border-2 border-green-500 bg-gray-800 scale-105`}
          >
            <h3 className="text-2xl font-bold text-green-400 mb-1">Level {level.level}</h3>
            <p className="text-md text-white mb-1">{level.rate.toLocaleString()} MEMEX / 1 SOL</p>
            <p className="text-green-300 mb-2">{progress.toFixed(1)}% sold</p>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-green-300 to-green-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <WalletButton label="Buy MEMEX" />
          </div>
        );
      case "future":
        return (
          <div
            key={level.level}
            className={`${baseClasses} bg-gray-800 border border-gray-600 text-gray-400 opacity-40`}
          >
            <h3 className="text-xl font-bold">Level {level.level}</h3>
            <p className="text-gray-500">Coming Soon</p>
            <div className="h-2 bg-gray-600 w-full rounded-full mt-2" />
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a1f] text-white px-4 pt-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">MEMEX Presale</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {previousLevel && renderLevelCard(previousLevel, "past")}
          {currentLevel && renderLevelCard(currentLevel, "current")}
          {nextLevel && renderLevelCard(nextLevel, "future")}
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">Presale Overview</h2>
          <ul className="space-y-2">
            {presaleLevels.map((level) => {
              const progress = (level.sold / level.total) * 100;
              const isSoldOut = level.sold >= level.total;
              const isActive = level === currentLevel;

              return (
                <li
                  key={level.level}
                  className={`flex justify-between items-center px-4 py-2 rounded-md border ${
                    isSoldOut
                      ? "border-red-400 bg-red-900 text-red-300"
                      : isActive
                      ? "border-green-500 bg-green-900 text-green-300"
                      : "border-gray-700 bg-gray-800 text-white"
                  }`}
                >
                  <span>Level {level.level}</span>
                  <span>{level.rate.toLocaleString()} MEMEX / 1 SOL</span>
                  <span>{progress.toFixed(1)}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </main>
  );
}