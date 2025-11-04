"use client";

import React, { useState } from "react";

interface ControlsProps {
  onPlay: (betAmount: number, dropColumn: number) => void;
  isPlaying: boolean;
  balance: number;
}

const Controls: React.FC<ControlsProps> = ({ onPlay, isPlaying, balance }) => {
  const [betAmount, setBetAmount] = useState(100);
  const [dropColumn, setDropColumn] = useState(6); // Center column

  const handlePlay = () => {
    if (!isPlaying && betAmount > 0 && betAmount <= balance) {
      onPlay(betAmount, dropColumn);
    }
  };

  const quickBets = [10, 50, 100, 500, 1000];

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
      <div className="space-y-6">
        {/* Balance Display */}
        <div className="text-center">
          <div className="text-sm text-gray-400">Balance</div>
          <div className="text-3xl font-bold text-white">
            ${(balance / 100).toFixed(2)}
          </div>
        </div>

        {/* Bet Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bet Amount (cents)
          </label>
          <input
            type="number"
            min="1"
            max={balance}
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            disabled={isPlaying}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />

          {/* Quick Bet Buttons */}
          <div className="flex gap-2 mt-2">
            {quickBets.map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={isPlaying || amount > balance}
                className="flex-1 px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/20 rounded text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ${amount / 100}
              </button>
            ))}
          </div>
        </div>

        {/* Drop Column Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Drop Column (0-12)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="12"
              value={dropColumn}
              onChange={(e) => setDropColumn(Number(e.target.value))}
              disabled={isPlaying}
              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              style={{
                background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${
                  (dropColumn / 12) * 100
                }%, rgba(255,255,255,0.2) ${
                  (dropColumn / 12) * 100
                }%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
            <div className="w-16 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-center text-white font-bold">
              {dropColumn}
            </div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Left</span>
            <span>Center</span>
            <span>Right</span>
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={handlePlay}
          disabled={isPlaying || betAmount <= 0 || betAmount > balance}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 rounded-xl font-bold text-white text-lg shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isPlaying ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Playing...
            </span>
          ) : (
            "🎲 Drop Ball"
          )}
        </button>

        {/* Keyboard Hint */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <div>⌨️ Keyboard: ← → to change column, Space to drop</div>
          <div>
            Expected:{" "}
            {betAmount > 0 ? `$${(betAmount / 100).toFixed(2)}` : "$0.00"} - $
            {((betAmount * 33) / 100).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
