import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateCombinedSeed } from "@/lib/hash";
import { generateGameResult, calculatePayoutMultiplier } from "@/lib/fairness";

/**
 * POST /api/rounds/:id/start
 * Starts a round with client seed and bet
 * Body: { clientSeed, betCents, dropColumn }
 * Returns: { path, binIndex, payoutMultiplier, winAmount }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { clientSeed, betCents, dropColumn } = await request.json();

    // Validate inputs
    if (
      !clientSeed ||
      typeof betCents !== "number" ||
      typeof dropColumn !== "number"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (dropColumn < 0 || dropColumn > 12) {
      return NextResponse.json(
        { error: "Invalid drop column" },
        { status: 400 }
      );
    }

    // Get round
    const round = await prisma.round.findUnique({
      where: { id },
    });

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (round.status !== "committed") {
      return NextResponse.json(
        { error: "Round already started" },
        { status: 400 }
      );
    }

    // Generate combined seed
    const combinedSeed = generateCombinedSeed(
      round.serverSeed!,
      clientSeed,
      round.nonce
    );

    // Generate game result deterministically
    const result = generateGameResult(combinedSeed, dropColumn);
    const payoutMultiplier = calculatePayoutMultiplier(result.binIndex);
    const winAmount = Math.round(betCents * payoutMultiplier);

    // Update round
    await prisma.round.update({
      where: { id },
      data: {
        status: "completed",
        clientSeed,
        combinedSeed,
        pegMapHash: result.pegMapHash,
        dropColumn,
        binIndex: result.binIndex,
        payoutMultiplier,
        betCents,
        pathJson: JSON.stringify(result.path),
      },
    });

    return NextResponse.json({
      path: result.path,
      binIndex: result.binIndex,
      payoutMultiplier,
      winAmount,
      pegMapHash: result.pegMapHash,
    });
  } catch (error) {
    console.error("Error starting round:", error);
    return NextResponse.json(
      { error: "Failed to start round" },
      { status: 500 }
    );
  }
}
