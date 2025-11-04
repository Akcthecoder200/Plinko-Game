"use client";

import React from "react";

const ROWS = 12;
const PEG_SIZE = 12;
const PEG_SPACING_X = 45;
const PEG_SPACING_Y = 50;

interface PegProps {
  row: number;
  col: number;
  isHit?: boolean;
}

const Peg: React.FC<PegProps> = ({ row, col, isHit }) => {
  // Calculate position for triangular layout
  const x = col * PEG_SPACING_X;
  const y = row * PEG_SPACING_Y;

  return (
    <div
      className={`absolute rounded-full bg-blue-400 transition-all duration-200 ${
        isHit ? "scale-150 bg-yellow-400 animate-bounce-peg" : "scale-100"
      }`}
      style={{
        width: `${PEG_SIZE}px`,
        height: `${PEG_SIZE}px`,
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};

interface BoardProps {
  hitPegs?: Set<string>;
  ballPosition?: { x: number; y: number } | null;
}

const Board: React.FC<BoardProps> = ({
  hitPegs = new Set(),
  ballPosition = null,
}) => {
  // Generate peg positions
  const pegs: { row: number; col: number; key: string }[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= row; col++) {
      const key = `${row}-${col}`;
      pegs.push({ row, col, key });
    }
  }

  // Calculate board dimensions
  const boardWidth = ROWS * PEG_SPACING_X + 100;
  const boardHeight = ROWS * PEG_SPACING_Y + 150;

  // Center offset to align triangle
  const centerOffset = ((ROWS - 1) * PEG_SPACING_X) / 2;

  return (
    <div className="relative flex items-center justify-center w-full min-h-[700px] p-8">
      {/* Board Container */}
      <div
        className="relative bg-gradient-to-b from-indigo-900/30 to-purple-900/30 rounded-2xl border-2 border-purple-500/30 shadow-2xl backdrop-blur-sm"
        style={{
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
        }}
      >
        {/* Pegs */}
        <div
          className="absolute top-20 left-1/2"
          style={{ transform: `translateX(-${centerOffset}px)` }}
        >
          {pegs.map((peg) => (
            <Peg
              key={peg.key}
              row={peg.row}
              col={peg.col}
              isHit={hitPegs.has(peg.key)}
            />
          ))}
        </div>

        {/* Ball */}
        {ballPosition && (
          <div
            className="absolute w-6 h-6 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full shadow-lg transition-all duration-100 ease-linear z-10"
            style={{
              left: `${boardWidth / 2 + ballPosition.x}px`,
              top: `${ballPosition.y + 20}px`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
            }}
          />
        )}

        {/* Drop Zone Indicators (at top) */}
        <div
          className="absolute top-2 left-1/2 flex gap-1"
          style={{ transform: `translateX(-${(ROWS * 20) / 2}px)` }}
        >
          {Array.from({ length: ROWS + 1 }, (_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-purple-400/30 hover:bg-purple-400/60 transition-colors cursor-pointer"
              title={`Drop at column ${i}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
