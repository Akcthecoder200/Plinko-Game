"use client";

import { useEffect, useState, useCallback } from "react";
import Board from "@/components/Board";
import Bins from "@/components/Bins";
import Controls from "@/components/Controls";
import History from "@/components/History";
import Confetti from "@/components/Confetti";
import { useGameState } from "@/hooks/useGameState";
import { useSoundManager } from "@/components/SoundManager";

export default function PlayPage() {
  const [selectedColumn, setSelectedColumn] = useState(6);
  const [isMuted, setIsMuted] = useState(false);

  // Sound manager
  const soundManager = useSoundManager();

  useEffect(() => {
    if (soundManager) {
      soundManager.setMuted(isMuted);
    }
  }, [isMuted, soundManager]);

  const handlePegHit = useCallback(() => {
    if (soundManager) {
      soundManager.pegHit();
    }
  }, [soundManager]);

  const handleWin = useCallback(
    (multiplier: number) => {
      if (!soundManager) return;

      if (multiplier >= 16) {
        soundManager.bigWin();
      } else if (multiplier > 1) {
        soundManager.win();
      } else {
        soundManager.loss();
      }
    },
    [soundManager]
  );

  const {
    isPlaying,
    ballPosition,
    hitPegs,
    finalBin,
    balance,
    playRound,
    commitHex,
    nonce,
    history,
    showConfetti,
  } = useGameState(100000, handlePegHit, handleWin);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlaying) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedColumn((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedColumn((prev) => Math.min(12, prev + 1));
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        // Trigger play from controls
        document
          .querySelector<HTMLButtonElement>("[data-play-button]")
          ?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  const handlePlay = async (betAmount: number, dropColumn: number) => {
    // Initialize sound on first interaction
    if (soundManager) {
      await soundManager.initialize();
    }
    setSelectedColumn(dropColumn);
    playRound(betAmount, dropColumn);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <a
              href="/"
              className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              🎰 Plinko Lab
            </a>
            <div className="text-xs text-gray-400 mt-1">
              Provably Fair Gaming
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Sound Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            {/* Verify Link */}
            <a
              href="/verify"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              Verify Results
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Game Board - Main Area */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-6">
            <Board hitPegs={hitPegs} ballPosition={ballPosition} />
            <Bins highlightedBin={finalBin} selectedColumn={selectedColumn} />
          </div>

          {/* Controls & Info - Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <Controls
              onPlay={handlePlay}
              isPlaying={isPlaying}
              balance={balance}
            />

            {/* Round Info */}
            {commitHex && (
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  🔐 Round Info
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-gray-500">Commit Hash:</div>
                    <div className="font-mono text-gray-300 break-all">
                      {commitHex.substring(0, 24)}...
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Nonce:</div>
                    <div className="font-mono text-gray-300">{nonce}</div>
                  </div>
                </div>
              </div>
            )}

            {/* How to Play */}
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                📖 How to Play
              </h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>1️⃣ Choose your bet amount</li>
                <li>2️⃣ Select drop column (0-12)</li>
                <li>3️⃣ Click "Drop Ball" or press Space</li>
                <li>4️⃣ Watch the ball bounce through pegs</li>
                <li>5️⃣ Win based on which bin it lands in!</li>
              </ul>
            </div>

            {/* Payout Table */}
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                💰 Payout Table
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-400">Edge Bins (0, 12):</div>
                <div className="text-orange-400 font-bold">33x</div>

                <div className="text-gray-400">Bins (1, 11):</div>
                <div className="text-orange-400 font-bold">16x</div>

                <div className="text-gray-400">Bins (2, 10):</div>
                <div className="text-yellow-400 font-bold">9x</div>

                <div className="text-gray-400">Bins (3, 9):</div>
                <div className="text-yellow-400 font-bold">5x</div>

                <div className="text-gray-400">Bins (4, 8):</div>
                <div className="text-green-400 font-bold">3x</div>

                <div className="text-gray-400">Bins (5, 7):</div>
                <div className="text-green-400 font-bold">1.5x</div>

                <div className="text-gray-400">Center Bin (6):</div>
                <div className="text-blue-400 font-bold">1.0x</div>
              </div>
            </div>

            {/* Game Stats */}
            {finalBin !== null && (
              <div className="p-4 bg-linear-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl border border-green-400/30 animate-pulse-slow">
                <h3 className="text-sm font-semibold text-green-300 mb-2">
                  🎉 Last Result
                </h3>
                <div className="text-2xl font-bold text-white">
                  Bin {finalBin}
                </div>
              </div>
            )}

            {/* Round History */}
            {history.length > 0 && (
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <History rounds={history} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6 text-center text-sm text-gray-500">
        <p>Provably Fair • Deterministic RNG • 100% Verifiable</p>
      </footer>

      {/* Confetti Animation */}
      {showConfetti && <Confetti active={showConfetti} />}
    </div>
  );
}
