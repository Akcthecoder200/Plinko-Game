"use client";

import React, { useState, useEffect } from "react";

const ROWS = 12;

// Responsive sizing - will be calculated based on screen size
const getResponsiveSize = () => {
  if (typeof window === "undefined")
    return { pegSize: 12, spacingX: 45, spacingY: 50 };

  const width = window.innerWidth;
  if (width < 640) {
    // mobile
    return { pegSize: 8, spacingX: 25, spacingY: 30 };
  } else if (width < 1024) {
    // tablet
    return { pegSize: 10, spacingX: 35, spacingY: 40 };
  } else {
    // desktop
    return { pegSize: 12, spacingX: 45, spacingY: 50 };
  }
};

interface PegProps {
  row: number;
  col: number;
  isHit?: boolean;
  pegSize: number;
  spacingX: number;
  spacingY: number;
}

const Peg: React.FC<PegProps> = ({
  row,
  col,
  isHit,
  pegSize,
  spacingX,
  spacingY,
}) => {
  // Calculate position for triangular layout
  const x = col * spacingX;
  const y = row * spacingY;

  return (
    <div
      className={`absolute rounded-full bg-blue-400 transition-all duration-200 ${
        isHit ? "scale-150 bg-yellow-400 animate-bounce-peg" : "scale-100"
      }`}
      style={{
        width: `${pegSize}px`,
        height: `${pegSize}px`,
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
  const [sizes, setSizes] = useState(getResponsiveSize());

  useEffect(() => {
    const handleResize = () => {
      setSizes(getResponsiveSize());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { pegSize, spacingX, spacingY } = sizes;

  // Generate peg positions
  const pegs: { row: number; col: number; key: string }[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= row; col++) {
      const key = `${row}-${col}`;
      pegs.push({ row, col, key });
    }
  }

  // Calculate board dimensions
  const boardWidth = ROWS * spacingX + 100;
  const boardHeight = ROWS * spacingY + 150;

  // Center offset to align triangle
  const centerOffset = ((ROWS - 1) * spacingX) / 2;

  // Ball size scales with board
  const ballSize = pegSize * 2;

  return (
    <div className="relative flex items-center justify-center w-full p-2 sm:p-4 md:p-8 overflow-hidden">
      {/* Board Container - responsive */}
      <div
        className="relative bg-linear-to-b from-indigo-900/30 to-purple-900/30 rounded-xl sm:rounded-2xl border border-purple-500/30 sm:border-2 shadow-2xl backdrop-blur-sm mx-auto"
        style={{
          width: `min(${boardWidth}px, 100%)`,
          height: `${boardHeight}px`,
          maxWidth: "100vw",
        }}
      >
        {/* Pegs */}
        <div
          className="absolute top-10 sm:top-20 left-1/2"
          style={{ transform: `translateX(-${centerOffset}px)` }}
        >
          {pegs.map((peg) => (
            <Peg
              key={peg.key}
              row={peg.row}
              col={peg.col}
              isHit={hitPegs.has(peg.key)}
              pegSize={pegSize}
              spacingX={spacingX}
              spacingY={spacingY}
            />
          ))}
        </div>

        {/* Ball */}
        {ballPosition && (
          <div
            className="absolute bg-linear-to-br from-yellow-300 to-orange-500 rounded-full shadow-lg transition-all duration-100 ease-linear z-10"
            style={{
              width: `${ballSize}px`,
              height: `${ballSize}px`,
              left: `${boardWidth / 2 + ballPosition.x}px`,
              top: `${ballPosition.y + 20}px`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
            }}
          />
        )}

        {/* Drop Zone Indicators (at top) */}
        <div
          className="absolute top-2 left-1/2 flex gap-0.5 sm:gap-1"
          style={{
            transform: `translateX(-${(ROWS * (spacingX / 2.5)) / 2}px)`,
          }}
        >
          {Array.from({ length: ROWS + 1 }, (_, i) => (
            <div
              key={i}
              className="rounded-full bg-purple-400/30 hover:bg-purple-400/60 transition-colors cursor-pointer"
              style={{
                width: `${pegSize}px`,
                height: `${pegSize}px`,
              }}
              title={`Drop at column ${i}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
