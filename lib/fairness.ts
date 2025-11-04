/**
 * Provably-Fair Plinko Game Engine
 * Implements deterministic outcome generation using xorshift32 PRNG
 */

import { DeterministicRNG } from "./prng";
import { sha256 } from "./hash";

export interface PegBias {
  row: number;
  col: number;
  leftBias: number; // 0.0 to 1.0, where > 0.5 favors left
}

export interface GamePath {
  row: number;
  col: number;
  direction: "L" | "R";
  bias: number;
  randValue: number;
}

export interface GameResult {
  binIndex: number;
  path: GamePath[];
  pegMap: PegBias[];
  pegMapHash: string;
}

const ROWS = 12;
const BINS = ROWS + 1; // 13 bins for 12 rows

/**
 * Generate peg bias map deterministically
 * Each peg has a leftBias between 0.4 and 0.6
 * Adjusted slightly based on drop column
 */
function generatePegMap(rng: DeterministicRNG, dropColumn: number): PegBias[] {
  const pegMap: PegBias[] = [];
  const centerColumn = ROWS / 2; // 6

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= row; col++) {
      // Base bias: 0.4 to 0.6 (slightly favors going straight)
      let leftBias = rng.nextFloat(0.4, 0.6);

      // Adjust bias based on drop column and current position
      // If dropped left of center, slightly favor left moves
      // If dropped right of center, slightly favor right moves
      const dropBias = (dropColumn - centerColumn) * 0.01;
      const positionBias = (col - row / 2) * 0.01;

      leftBias += dropBias + positionBias;

      // Clamp to [0.35, 0.65] to keep some randomness
      leftBias = Math.max(0.35, Math.min(0.65, leftBias));

      pegMap.push({ row, col, leftBias });
    }
  }

  return pegMap;
}

/**
 * Simulate ball drop through pegs
 * Returns the path taken and final bin index
 */
function simulateDrop(
  rng: DeterministicRNG,
  pegMap: PegBias[],
  dropColumn: number
): { path: GamePath[]; binIndex: number } {
  const path: GamePath[] = [];
  let currentCol = dropColumn;

  for (let row = 0; row < ROWS; row++) {
    // Find peg at current position
    const pegIndex = pegMap.findIndex(
      (p) => p.row === row && p.col === currentCol
    );

    if (pegIndex === -1) {
      // This shouldn't happen with proper logic
      throw new Error(`No peg found at row ${row}, col ${currentCol}`);
    }

    const peg = pegMap[pegIndex];
    const randValue = rng.next();

    // Determine direction: if randValue < leftBias, go left
    const goesLeft = randValue < peg.leftBias;
    const direction: "L" | "R" = goesLeft ? "L" : "R";

    path.push({
      row,
      col: currentCol,
      direction,
      bias: peg.leftBias,
      randValue,
    });

    // Update position for next row
    // Going left keeps same column index, going right increments it
    if (!goesLeft) {
      currentCol++;
    }
  }

  // Final position is the bin index
  const binIndex = currentCol;

  return { path, binIndex };
}

/**
 * Calculate payout multiplier based on bin index
 * Center bins have lower multipliers, edge bins have higher
 * Distribution follows a binomial-like curve
 */
export function calculatePayoutMultiplier(binIndex: number): number {
  // Payout multipliers for each bin (0-12)
  // Center bins (5-7) have lower payouts, edges have higher
  const payoutTable = [
    33.0, // Bin 0 (far left)
    16.0, // Bin 1
    9.0, // Bin 2
    5.0, // Bin 3
    3.0, // Bin 4
    1.5, // Bin 5
    1.0, // Bin 6 (center)
    1.5, // Bin 7
    3.0, // Bin 8
    5.0, // Bin 9
    9.0, // Bin 10
    16.0, // Bin 11
    33.0, // Bin 12 (far right)
  ];

  return payoutTable[binIndex] || 1.0;
}

/**
 * Main game engine: Generate complete game result deterministically
 * @param combinedSeedHex - SHA-256 hash used to seed RNG
 * @param dropColumn - Starting column (0-12)
 * @returns Complete game result with path, bin, and verification hash
 */
export function generateGameResult(
  combinedSeedHex: string,
  dropColumn: number
): GameResult {
  // Validate inputs
  if (dropColumn < 0 || dropColumn > ROWS) {
    throw new Error(`Invalid dropColumn: ${dropColumn}. Must be 0-${ROWS}`);
  }

  // Create deterministic RNG from combined seed
  const rng = new DeterministicRNG(combinedSeedHex);

  // Generate peg bias map
  const pegMap = generatePegMap(rng, dropColumn);

  // Calculate peg map hash for verification
  const pegMapHash = sha256(JSON.stringify(pegMap));

  // Simulate ball drop
  const { path, binIndex } = simulateDrop(rng, pegMap, dropColumn);

  return {
    binIndex,
    path,
    pegMap,
    pegMapHash,
  };
}

/**
 * Verify a game result by regenerating it
 * @param combinedSeedHex - The combined seed hex
 * @param dropColumn - Drop column used
 * @param expectedBinIndex - Expected final bin
 * @param expectedPegMapHash - Expected peg map hash
 * @returns True if verification passes
 */
export function verifyGameResult(
  combinedSeedHex: string,
  dropColumn: number,
  expectedBinIndex: number,
  expectedPegMapHash: string
): boolean {
  try {
    const result = generateGameResult(combinedSeedHex, dropColumn);
    return (
      result.binIndex === expectedBinIndex &&
      result.pegMapHash === expectedPegMapHash
    );
  } catch (error) {
    return false;
  }
}
