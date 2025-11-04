/**
 * Cryptographic hashing utilities using Node.js crypto module
 * Uses SHA-256 for all hashing operations
 */

import crypto from "crypto";

/**
 * Generate SHA-256 hash of input string
 * @param input - String to hash
 * @returns Hexadecimal hash string (64 chars)
 */
export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Generate a random hex string for server seed
 * @param bytes - Number of bytes (default 32 = 64 hex chars)
 * @returns Random hexadecimal string
 */
export function generateRandomHex(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generate commit hash for provably-fair protocol
 * @param serverSeed - Server's secret seed
 * @param nonce - Round nonce
 * @returns SHA-256 hash of "serverSeed:nonce"
 */
export function generateCommitHash(serverSeed: string, nonce: string): string {
  return sha256(`${serverSeed}:${nonce}`);
}

/**
 * Generate combined seed for RNG
 * @param serverSeed - Server's secret seed
 * @param clientSeed - Client's provided seed
 * @param nonce - Round nonce
 * @returns SHA-256 hash of "serverSeed:clientSeed:nonce"
 */
export function generateCombinedSeed(
  serverSeed: string,
  clientSeed: string,
  nonce: string
): string {
  return sha256(`${serverSeed}:${clientSeed}:${nonce}`);
}

/**
 * Verify that a commit hash is valid
 * @param commitHex - The commit hash to verify
 * @param serverSeed - The revealed server seed
 * @param nonce - The round nonce
 * @returns True if valid, false otherwise
 */
export function verifyCommitHash(
  commitHex: string,
  serverSeed: string,
  nonce: string
): boolean {
  const expectedHash = generateCommitHash(serverSeed, nonce);
  return commitHex === expectedHash;
}
