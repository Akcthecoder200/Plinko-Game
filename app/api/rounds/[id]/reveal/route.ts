import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/rounds/:id/reveal
 * Reveals the server seed for verification
 * Returns: { serverSeed, revealedAt }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const round = await prisma.round.findUnique({
      where: { id },
    });

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (round.status !== "completed") {
      return NextResponse.json(
        { error: "Round not completed yet" },
        { status: 400 }
      );
    }

    // Update with reveal timestamp
    const updatedRound = await prisma.round.update({
      where: { id },
      data: {
        revealedAt: new Date(),
      },
    });

    return NextResponse.json({
      serverSeed: updatedRound.serverSeed,
      revealedAt: updatedRound.revealedAt,
    });
  } catch (error) {
    console.error("Error revealing round:", error);
    return NextResponse.json(
      { error: "Failed to reveal round" },
      { status: 500 }
    );
  }
}
