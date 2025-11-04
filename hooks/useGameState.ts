"use client";

import { useState, useCallback, useEffect } from "react";
import { GamePath } from "@/lib/fairness";

interface BallPosition {
  x: number;
  y: number;
}

interface GameState {
  isPlaying: boolean;
  ballPosition: BallPosition | null;
  hitPegs: Set<string>;
  finalBin: number | null;
  path: GamePath[];
  balance: number;
  roundId: string | null;
  commitHex: string | null;
  nonce: string | null;
}

const PEG_SPACING_X = 45;
const PEG_SPACING_Y = 50;
const ANIMATION_DELAY = 300; // ms per step

export function useGameState(initialBalance: number = 100000) {
  const [state, setState] = useState<GameState>({
    isPlaying: false,
    ballPosition: null,
    hitPegs: new Set(),
    finalBin: null,
    path: [],
    balance: initialBalance,
    roundId: null,
    commitHex: null,
    nonce: null,
  });

  // Animate ball drop through path
  const animatePath = useCallback(
    async (path: GamePath[], dropColumn: number) => {
      const newHitPegs = new Set<string>();
      let currentX = (dropColumn - 6) * PEG_SPACING_X; // Offset from center
      let currentY = 0;

      // Start position
      setState((prev) => ({
        ...prev,
        ballPosition: { x: currentX, y: currentY },
        hitPegs: new Set(),
      }));

      // Animate through each step
      for (let i = 0; i < path.length; i++) {
        const step = path[i];

        await new Promise((resolve) => setTimeout(resolve, ANIMATION_DELAY));

        // Update position based on direction
        if (step.direction === "R") {
          currentX += PEG_SPACING_X;
        }
        // Left stays same X

        currentY += PEG_SPACING_Y;

        // Mark peg as hit
        const pegKey = `${step.row}-${step.col}`;
        newHitPegs.add(pegKey);

        setState((prev) => ({
          ...prev,
          ballPosition: { x: currentX, y: currentY },
          hitPegs: new Set(newHitPegs),
        }));
      }

      // Final position in bin
      await new Promise((resolve) => setTimeout(resolve, ANIMATION_DELAY));

      return path.length > 0
        ? path[path.length - 1].col +
            (path[path.length - 1].direction === "R" ? 1 : 0)
        : dropColumn;
    },
    []
  );

  // Play a round
  const playRound = useCallback(
    async (betAmount: number, dropColumn: number) => {
      if (state.isPlaying || betAmount > state.balance) return;

      setState((prev) => ({
        ...prev,
        isPlaying: true,
        ballPosition: null,
        hitPegs: new Set(),
        finalBin: null,
        path: [],
      }));

      try {
        // 1. Commit phase
        const commitRes = await fetch("/api/rounds/commit", {
          method: "POST",
        });
        const commitData = await commitRes.json();

        setState((prev) => ({
          ...prev,
          roundId: commitData.roundId,
          commitHex: commitData.commitHex,
          nonce: commitData.nonce,
        }));

        // 2. Start/Play phase
        const startRes = await fetch(
          `/api/rounds/${commitData.roundId}/start`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientSeed: `user-${Date.now()}`,
              betCents: betAmount,
              dropColumn,
            }),
          }
        );

        if (!startRes.ok) {
          const errorData = await startRes.json();
          throw new Error(errorData.error || "Failed to start round");
        }

        const startData = await startRes.json();

        // Check if we have valid data
        if (!startData.path || !Array.isArray(startData.path)) {
          throw new Error("Invalid game data received");
        }

        // 3. Animate the ball
        const finalBin = await animatePath(startData.path, dropColumn);

        // 4. Update balance and final state
        const winAmount = Math.round(betAmount * startData.payoutMultiplier);

        setState((prev) => ({
          ...prev,
          isPlaying: false,
          finalBin,
          path: startData.path,
          balance: prev.balance - betAmount + winAmount,
        }));

        // Show result for a moment
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Reset for next round
        setState((prev) => ({
          ...prev,
          ballPosition: null,
          hitPegs: new Set(),
          finalBin: null,
        }));
      } catch (error) {
        console.error("Error playing round:", error);
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          ballPosition: null,
          hitPegs: new Set(),
        }));
      }
    },
    [state.isPlaying, state.balance, animatePath]
  );

  return {
    ...state,
    playRound,
  };
}
