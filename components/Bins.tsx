"use client";

import React from "react";

const BINS = 13;

// Payout multipliers for each bin (matches fairness.ts)
const PAYOUT_MULTIPLIERS = [
  33.0, 16.0, 9.0, 5.0, 3.0, 1.5, 1.0, 1.5, 3.0, 5.0, 9.0, 16.0, 33.0,
];

interface BinsProps {
  highlightedBin?: number | null;
  selectedColumn?: number;
}

const Bins: React.FC<BinsProps> = ({
  highlightedBin = null,
  selectedColumn,
}) => {
  return (
    <div className="w-full px-8">
      <div className="flex justify-center gap-1 max-w-4xl mx-auto">
        {PAYOUT_MULTIPLIERS.map((multiplier, index) => {
          const isHighlighted = highlightedBin === index;
          const isSelected = selectedColumn === index;

          // Color coding based on payout
          let colorClass = "bg-blue-500/20 border-blue-400/40";
          if (multiplier >= 16) {
            colorClass = "bg-orange-500/20 border-orange-400/40";
          } else if (multiplier >= 5) {
            colorClass = "bg-yellow-500/20 border-yellow-400/40";
          } else if (multiplier >= 3) {
            colorClass = "bg-green-500/20 border-green-400/40";
          }

          return (
            <div
              key={index}
              className={`
                relative flex flex-col items-center justify-center
                min-w-[50px] h-24 rounded-lg border-2 transition-all duration-300
                ${colorClass}
                ${
                  isHighlighted
                    ? "scale-110 ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50"
                    : ""
                }
                ${isSelected ? "ring-2 ring-purple-400" : ""}
              `}
            >
              {/* Multiplier */}
              <div
                className={`text-lg font-bold ${
                  isHighlighted ? "text-yellow-300 scale-125" : "text-white"
                } transition-all`}
              >
                {multiplier}x
              </div>

              {/* Bin number */}
              <div className="text-xs text-gray-400 mt-1">{index}</div>

              {/* Glow effect for high multipliers */}
              {multiplier >= 16 && (
                <div className="absolute inset-0 bg-orange-500/10 rounded-lg blur-sm -z-10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bins;
