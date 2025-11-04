import { NextRequest, NextResponse } from "next/server";
import {
  generateCommitHash,
  generateCombinedSeed,
  verifyCommitHash,
} from "@/lib/hash";
import { generateGameResult, verifyGameResult } from "@/lib/fairness";

/**
 * GET /api/verify?serverSeed=...&clientSeed=...&nonce=...&dropColumn=...
 * Verify a round by regenerating outcome
 * Returns: Verification details and recreated game data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serverSeed = searchParams.get("serverSeed");
    const clientSeed = searchParams.get("clientSeed");
    const nonce = searchParams.get("nonce");
    const dropColumn = searchParams.get("dropColumn");
    const expectedBinIndex = searchParams.get("binIndex");
    const expectedPegMapHash = searchParams.get("pegMapHash");

    if (!serverSeed || !clientSeed || !nonce || !dropColumn) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const dropCol = parseInt(dropColumn);
    if (isNaN(dropCol) || dropCol < 0 || dropCol > 12) {
      return NextResponse.json(
        { error: "Invalid drop column" },
        { status: 400 }
      );
    }

    // Regenerate commit hash
    const commitHex = generateCommitHash(serverSeed, nonce);

    // Regenerate combined seed
    const combinedSeed = generateCombinedSeed(serverSeed, clientSeed, nonce);

    // Regenerate game result
    const result = generateGameResult(combinedSeed, dropCol);

    // Verify if expected values provided
    let isVerified = true;
    if (expectedBinIndex !== null) {
      isVerified =
        isVerified && result.binIndex === parseInt(expectedBinIndex || "");
    }
    if (expectedPegMapHash) {
      isVerified = isVerified && result.pegMapHash === expectedPegMapHash;
    }

    return NextResponse.json({
      isVerified,
      commitHex,
      combinedSeed,
      binIndex: result.binIndex,
      pegMapHash: result.pegMapHash,
      path: result.path,
      message: isVerified
        ? "Round verified successfully! Results match."
        : "Verification failed. Results do not match.",
    });
  } catch (error) {
    console.error("Error verifying round:", error);
    return NextResponse.json(
      { error: "Failed to verify round" },
      { status: 500 }
    );
  }
}
