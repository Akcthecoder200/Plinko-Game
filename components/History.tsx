"use client";

import { calculatePayoutMultiplier } from "@/lib/fairness";

interface RoundHistory {
  id: string;
  betAmount: number;
  dropColumn: number;
  binIndex: number;
  multiplier: number;
  winAmount: number;
  timestamp: number;
}

interface HistoryProps {
  rounds: RoundHistory[];
}

export default function History({ rounds }: HistoryProps) {
  if (rounds.length === 0) {
    return (
      <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-center text-gray-400 text-xs sm:text-sm">
        No rounds played yet. Start playing to see history!
      </div>
    );
  }

  const stats = {
    totalRounds: rounds.length,
    totalBet: rounds.reduce((sum, r) => sum + r.betAmount, 0),
    totalWon: rounds.reduce((sum, r) => sum + r.winAmount, 0),
    biggestWin: Math.max(...rounds.map((r) => r.winAmount)),
    winRate:
      rounds.filter((r) => r.winAmount > r.betAmount).length / rounds.length,
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div>
          <div className="text-[10px] sm:text-xs text-gray-400">
            Total Rounds
          </div>
          <div className="text-base sm:text-lg font-bold text-white">
            {stats.totalRounds}
          </div>
        </div>
        <div>
          <div className="text-[10px] sm:text-xs text-gray-400">Win Rate</div>
          <div className="text-base sm:text-lg font-bold text-white">
            {(stats.winRate * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] sm:text-xs text-gray-400">Net P/L</div>
          <div
            className={`text-base sm:text-lg font-bold ${
              stats.totalWon >= stats.totalBet
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            ${((stats.totalWon - stats.totalBet) / 100).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-[10px] sm:text-xs text-gray-400">
            Biggest Win
          </div>
          <div className="text-base sm:text-lg font-bold text-yellow-400">
            ${(stats.biggestWin / 100).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Round List */}
      <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 sm:mb-3">
          Recent Rounds
        </h3>
        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
          {rounds
            .slice(-10)
            .reverse()
            .map((round, idx) => {
              const profit = round.winAmount - round.betAmount;
              const isWin = profit > 0;

              return (
                <div
                  key={round.id || idx}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                        round.multiplier >= 16
                          ? "bg-orange-500/20 text-orange-400"
                          : round.multiplier >= 5
                          ? "bg-yellow-500/20 text-yellow-400"
                          : round.multiplier >= 3
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {round.multiplier}x
                    </div>
                    <div>
                      <div className="text-white font-medium text-xs sm:text-sm">
                        Bin {round.binIndex}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">
                        Drop: {round.dropColumn}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs sm:text-sm font-bold ${
                        isWin ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isWin ? "+" : ""}${(profit / 100).toFixed(2)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      ${(round.betAmount / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
