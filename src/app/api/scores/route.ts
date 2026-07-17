import { NextResponse } from "next/server";
import { addScore, topScores } from "@/lib/store";
import type { GameMode } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/scores?limit=10 -> tabla de puntuaciones (leaderboard).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);
  const scores = await topScores(limit);
  return NextResponse.json({ scores });
}

// POST /api/scores -> guarda una puntuación.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { player, score, mode, daily } = (body ?? {}) as {
    player?: unknown;
    score?: unknown;
    mode?: unknown;
    daily?: unknown;
  };

  const validModes: GameMode[] = ["twitch", "youtube", "mixed", "plagiosdev"];
  if (
    typeof player !== "string" ||
    player.trim().length === 0 ||
    typeof score !== "number" ||
    !Number.isFinite(score) ||
    score < 0 ||
    typeof mode !== "string" ||
    !validModes.includes(mode as GameMode)
  ) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const saved = await addScore({
    player: player.trim().slice(0, 24),
    score: Math.round(score),
    mode: mode as GameMode,
    daily: Boolean(daily),
  });

  return NextResponse.json({ entry: saved }, { status: 201 });
}
