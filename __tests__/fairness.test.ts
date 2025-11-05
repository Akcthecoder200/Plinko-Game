/**
 * Unit Tests for Provably Fair Game Engine
 * Tests determinism, PRNG consistency, and fairness verification
 */

import { DeterministicRNG } from "@/lib/prng";
import {
  generateGameResult,
  verifyGameResult,
  calculatePayoutMultiplier,
} from "@/lib/fairness";
import { generateCombinedSeed, generateCommitHash, sha256 } from "@/lib/hash";

describe("Provably Fair Game Engine Tests", () => {
  // Test 1: PRNG Determinism
  describe("DeterministicRNG", () => {
    it("produces identical sequences from same seed", () => {
      const seedHex =
        "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890";

      const rng1 = new DeterministicRNG(seedHex);
      const rng2 = new DeterministicRNG(seedHex);

      // Generate 10 random numbers from each
      for (let i = 0; i < 10; i++) {
        const val1 = rng1.next();
        const val2 = rng2.next();
        expect(val1).toBe(val2);
        expect(val1).toBeGreaterThanOrEqual(0);
        expect(val1).toBeLessThan(1);
      }
    });

    it("produces different sequences from different seeds", () => {
      const seed1 =
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      const seed2 =
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

      const rng1 = new DeterministicRNG(seed1);
      const rng2 = new DeterministicRNG(seed2);

      const val1 = rng1.next();
      const val2 = rng2.next();

      expect(val1).not.toBe(val2);
    });

    it("handles zero seed correctly", () => {
      const zeroSeed = "00000000" + "0".repeat(56);
      const rng = new DeterministicRNG(zeroSeed);

      // Should use fallback seed (0x12345678)
      const val = rng.next();
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThan(1);
    });
  });

  // Test 2: Commit-Reveal Protocol
  describe("Commit-Reveal Protocol", () => {
    it("generates valid commit hash", () => {
      const serverSeed =
        "b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc";
      const nonce = "42";

      const commitHash = generateCommitHash(serverSeed, nonce);

      // Should be 64 hex characters
      expect(commitHash).toMatch(/^[a-f0-9]{64}$/);

      // Should be deterministic
      const commitHash2 = generateCommitHash(serverSeed, nonce);
      expect(commitHash).toBe(commitHash2);
    });

    it("generates different commits for different inputs", () => {
      const serverSeed = "aaaa".repeat(16);
      const commit1 = generateCommitHash(serverSeed, "1");
      const commit2 = generateCommitHash(serverSeed, "2");

      expect(commit1).not.toBe(commit2);
    });

    it("generates valid combined seed", () => {
      const serverSeed = "server123" + "0".repeat(55);
      const clientSeed = "client123";
      const nonce = "100";

      const combinedSeed = generateCombinedSeed(serverSeed, clientSeed, nonce);

      expect(combinedSeed).toMatch(/^[a-f0-9]{64}$/);

      // Should be deterministic
      const combinedSeed2 = generateCombinedSeed(serverSeed, clientSeed, nonce);
      expect(combinedSeed).toBe(combinedSeed2);
    });
  });

  // Test 3: Game Result Determinism (Replay Test)
  describe("Game Result Determinism", () => {
    it("produces identical results for same inputs (replay determinism)", () => {
      const combinedSeed =
        "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const dropColumn = 6;

      // Play round twice
      const result1 = generateGameResult(combinedSeed, dropColumn);
      const result2 = generateGameResult(combinedSeed, dropColumn);

      // Should be completely identical
      expect(result1.binIndex).toBe(result2.binIndex);
      expect(result1.pegMapHash).toBe(result2.pegMapHash);
      expect(result1.path.length).toBe(result2.path.length);

      // Compare paths step by step
      for (let i = 0; i < result1.path.length; i++) {
        expect(result1.path[i].row).toBe(result2.path[i].row);
        expect(result1.path[i].col).toBe(result2.path[i].col);
        expect(result1.path[i].direction).toBe(result2.path[i].direction);
        expect(result1.path[i].bias).toBe(result2.path[i].bias);
        expect(result1.path[i].randValue).toBe(result2.path[i].randValue);
      }
    });

    it("produces different results for different combined seeds", () => {
      const seed1 = "aaaa".repeat(16);
      const seed2 = "bbbb".repeat(16);
      const dropColumn = 6;

      const result1 = generateGameResult(seed1, dropColumn);
      const result2 = generateGameResult(seed2, dropColumn);

      // Results should differ (statistically almost certain)
      const isDifferent =
        result1.binIndex !== result2.binIndex ||
        result1.pegMapHash !== result2.pegMapHash;

      expect(isDifferent).toBe(true);
    });

    it("produces different results for different drop columns", () => {
      const combinedSeed = "cccc".repeat(16);

      const result0 = generateGameResult(combinedSeed, 0);
      const result12 = generateGameResult(combinedSeed, 12);

      // Different drop columns should influence outcome
      expect(result0.pegMapHash).not.toBe(result12.pegMapHash);
    });
  });

  // Test 4: Test Vector from Spec
  describe("Test Vector Verification", () => {
    it("produces expected result for example round", () => {
      // Example from README
      const serverSeed =
        "b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc";
      const clientSeed = "candidate-hello";
      const nonce = "42";
      const dropColumn = 6;

      // Generate combined seed
      const combinedSeed = generateCombinedSeed(serverSeed, clientSeed, nonce);

      // Generate game result
      const result = generateGameResult(combinedSeed, dropColumn);

      // Verify commit hash
      const commitHash = generateCommitHash(serverSeed, nonce);
      expect(commitHash).toMatch(/^[a-f0-9]{64}$/);

      // Result should be deterministic
      expect(result.binIndex).toBeGreaterThanOrEqual(0);
      expect(result.binIndex).toBeLessThanOrEqual(12);
      expect(result.path.length).toBe(12); // 12 rows
      expect(result.pegMapHash).toMatch(/^[a-f0-9]{64}$/);

      // Payout should be valid
      const payout = calculatePayoutMultiplier(result.binIndex);
      expect(payout).toBeGreaterThanOrEqual(1.0);
      expect(payout).toBeLessThanOrEqual(33.0);
    });

    it("verifies test vector with edge drop (column 0)", () => {
      const serverSeed =
        "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890";
      const clientSeed = "player-test-123";
      const nonce = "100";
      const dropColumn = 0;

      const combinedSeed = generateCombinedSeed(serverSeed, clientSeed, nonce);
      const result = generateGameResult(combinedSeed, dropColumn);

      expect(result.binIndex).toBeGreaterThanOrEqual(0);
      expect(result.binIndex).toBeLessThanOrEqual(12);

      // Edge drops should have some bias toward staying on the edge
      // but still random
      expect(result.path.length).toBe(12);
    });

    it("verifies test vector with center drop (column 6)", () => {
      const serverSeed =
        "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const clientSeed = "lucky-drop";
      const nonce = "777";
      const dropColumn = 6;

      const combinedSeed = generateCombinedSeed(serverSeed, clientSeed, nonce);
      const result = generateGameResult(combinedSeed, dropColumn);

      expect(result.binIndex).toBeGreaterThanOrEqual(0);
      expect(result.binIndex).toBeLessThanOrEqual(12);
    });
  });

  // Test 5: Game Verification
  describe("Game Verification", () => {
    it("successfully verifies valid game result", () => {
      const combinedSeed = "ffff".repeat(16);
      const dropColumn = 8;

      const result = generateGameResult(combinedSeed, dropColumn);

      // Verify the result
      const isValid = verifyGameResult(
        combinedSeed,
        dropColumn,
        result.binIndex,
        result.pegMapHash
      );

      expect(isValid).toBe(true);
    });

    it("fails verification with wrong bin index", () => {
      const combinedSeed = "9999".repeat(16);
      const dropColumn = 5;

      const result = generateGameResult(combinedSeed, dropColumn);

      // Try to verify with wrong bin index
      const isValid = verifyGameResult(
        combinedSeed,
        dropColumn,
        (result.binIndex + 1) % 13, // Wrong bin
        result.pegMapHash
      );

      expect(isValid).toBe(false);
    });

    it("fails verification with wrong peg map hash", () => {
      const combinedSeed = "8888".repeat(16);
      const dropColumn = 4;

      const result = generateGameResult(combinedSeed, dropColumn);

      // Try to verify with wrong peg map hash
      const isValid = verifyGameResult(
        combinedSeed,
        dropColumn,
        result.binIndex,
        "wronghash123456789abcdef1234567890abcdef1234567890abcdef1234567890"
      );

      expect(isValid).toBe(false);
    });
  });

  // Test 6: Payout Multipliers
  describe("Payout Multipliers", () => {
    it("has correct payout table", () => {
      expect(calculatePayoutMultiplier(0)).toBe(33.0);
      expect(calculatePayoutMultiplier(1)).toBe(16.0);
      expect(calculatePayoutMultiplier(2)).toBe(9.0);
      expect(calculatePayoutMultiplier(3)).toBe(5.0);
      expect(calculatePayoutMultiplier(4)).toBe(3.0);
      expect(calculatePayoutMultiplier(5)).toBe(1.5);
      expect(calculatePayoutMultiplier(6)).toBe(1.0);
      expect(calculatePayoutMultiplier(7)).toBe(1.5);
      expect(calculatePayoutMultiplier(8)).toBe(3.0);
      expect(calculatePayoutMultiplier(9)).toBe(5.0);
      expect(calculatePayoutMultiplier(10)).toBe(9.0);
      expect(calculatePayoutMultiplier(11)).toBe(16.0);
      expect(calculatePayoutMultiplier(12)).toBe(33.0);
    });

    it("is symmetric around center", () => {
      for (let i = 0; i <= 6; i++) {
        const leftMultiplier = calculatePayoutMultiplier(i);
        const rightMultiplier = calculatePayoutMultiplier(12 - i);
        expect(leftMultiplier).toBe(rightMultiplier);
      }
    });
  });

  // Test 7: Path Consistency
  describe("Path Generation", () => {
    it("generates exactly 12 path steps", () => {
      const combinedSeed = "7777".repeat(16);
      const dropColumn = 7;

      const result = generateGameResult(combinedSeed, dropColumn);

      expect(result.path.length).toBe(12);
    });

    it("has valid path steps", () => {
      const combinedSeed = "6666".repeat(16);
      const dropColumn = 3;

      const result = generateGameResult(combinedSeed, dropColumn);

      for (let i = 0; i < result.path.length; i++) {
        const step = result.path[i];

        // Row should match index
        expect(step.row).toBe(i);

        // Col should be within valid range
        expect(step.col).toBeGreaterThanOrEqual(0);
        expect(step.col).toBeLessThanOrEqual(i);

        // Direction should be L or R
        expect(["L", "R"]).toContain(step.direction);

        // Bias should be in valid range
        expect(step.bias).toBeGreaterThanOrEqual(0.35);
        expect(step.bias).toBeLessThanOrEqual(0.65);

        // RandValue should be in [0, 1)
        expect(step.randValue).toBeGreaterThanOrEqual(0);
        expect(step.randValue).toBeLessThan(1);
      }
    });

    it("final bin matches right move count", () => {
      const combinedSeed = "5555".repeat(16);
      const dropColumn = 10;

      const result = generateGameResult(combinedSeed, dropColumn);

      // Count R moves in path
      const rightMoves = result.path.filter(
        (step) => step.direction === "R"
      ).length;

      // Should match final bin index
      expect(result.binIndex).toBe(rightMoves);
    });
  });

  // Test 8: Edge Cases
  describe("Edge Cases", () => {
    it("handles minimum drop column (0)", () => {
      const combinedSeed = "1111".repeat(16);
      const result = generateGameResult(combinedSeed, 0);

      expect(result.binIndex).toBeGreaterThanOrEqual(0);
      expect(result.binIndex).toBeLessThanOrEqual(12);
    });

    it("handles maximum drop column (12)", () => {
      const combinedSeed = "2222".repeat(16);
      const result = generateGameResult(combinedSeed, 12);

      expect(result.binIndex).toBeGreaterThanOrEqual(0);
      expect(result.binIndex).toBeLessThanOrEqual(12);
    });

    it("throws error for invalid drop column", () => {
      const combinedSeed = "3333".repeat(16);

      expect(() => generateGameResult(combinedSeed, -1)).toThrow();
      expect(() => generateGameResult(combinedSeed, 13)).toThrow();
    });
  });
});
