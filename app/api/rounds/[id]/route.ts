import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/rounds/:id
 * Get round details
 * Returns: Full round data (serverSeed only if revealed)
 */
export async function GET(
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

    // Hide server seed if not revealed
    const response = {
      ...round,
      serverSeed: round.revealedAt ? round.serverSeed : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching round:", error);
    return NextResponse.json(
      { error: "Failed to fetch round" },
      { status: 500 }
    );
  }
}
