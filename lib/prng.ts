/**
 * Deterministic PRNG using xorshift32 algorithm
 * Seeded from a hex string for reproducible randomness
 */

export class DeterministicRNG {
  private state: number;
  private callCount: number = 0;

  /**
   * Initialize RNG with a seed from hex string
   * @param seedHex - Hexadecimal seed string (e.g., SHA-256 hash)
   */
  constructor(seedHex: string) {
    // Convert first 8 hex chars to 32-bit unsigned integer
    // This ensures we get a valid non-zero seed
    this.state = parseInt(seedHex.substring(0, 8), 16);

    // Ensure state is never 0 (xorshift32 requirement)
    if (this.state === 0) {
      this.state = 0x12345678;
    }
  }

  /**
   * Get next random number using xorshift32
   * @returns Number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    this.callCount++;

    // xorshift32 algorithm
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0; // Convert to unsigned 32-bit

    // Convert to [0, 1) range
    return this.state / 0x100000000;
  }

  /**
   * Get random integer in range [min, max)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Get random float in range [min, max)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Get current call count (useful for debugging)
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Reset call count
   */
  resetCallCount(): void {
    this.callCount = 0;
  }
}

/**
 * Create RNG instance from seed hex
 */
export function createRNG(seedHex: string): DeterministicRNG {
  return new DeterministicRNG(seedHex);
}
