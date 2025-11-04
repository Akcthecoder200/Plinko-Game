import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateRandomHex, generateCommitHash } from "@/lib/hash";

/**
 * POST /api/rounds/commit
 * Creates a new round with commit hash
 * Returns: { roundId, commitHex, nonce }
 */
export async function POST(request: NextRequest) {
  try {
    // Generate server seed and nonce
    const serverSeed = generateRandomHex(32); // 64 hex chars
    const nonce = Math.floor(Math.random() * 1000000).toString();

    // Generate commit hash (don't reveal serverSeed yet)
    const commitHex = generateCommitHash(serverSeed, nonce);

    // Create round in database
    const round = await prisma.round.create({
      data: {
        status: "committed",
        nonce,
        commitHex,
        serverSeed, // Store but don't reveal yet
        clientSeed: "", // Will be set in start
        combinedSeed: "", // Will be set in start
        pegMapHash: "", // Will be set in start
        rows: 12,
        dropColumn: 0, // Will be set in start
        binIndex: 0, // Will be set in start
        payoutMultiplier: 0, // Will be set in start
        betCents: 0, // Will be set in start
        pathJson: "[]", // Will be set in start
      },
    });

    return NextResponse.json({
      roundId: round.id,
      commitHex: round.commitHex,
      nonce: round.nonce,
    });
  } catch (error) {
    console.error("Error creating round:", error);
    return NextResponse.json(
      { error: "Failed to create round" },
      { status: 500 }
    );
  }
}
