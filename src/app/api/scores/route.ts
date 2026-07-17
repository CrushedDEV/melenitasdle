import { NextResponse } from "next/server";
import { addScore, topScores, usingRedis } from "@/lib/store";
import type { GameMode } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/scores?limit=10 -> tabla de puntuaciones (leaderboard).
// Incluye `storage` para diagnosticar: "redis" (persistente) o "file" (local).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);
  try {
    const scores = await topScores(limit);
    return NextResponse.json({
      scores,
      storage: usingRedis ? "redis" : "file",
    });
  } catch (e) {
    console.error("[scores] GET error", e);
    return NextResponse.json(
      { scores: [], storage: usingRedis ? "redis" : "file", error: "read_failed" },
      { status: 200 },
    );
  }
}

// POST /api/scores -> guarda (upsert) la puntuación del jugador.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { player, score, mode } = (body ?? {}) as {
    player?: unknown;
    score?: unknown;
    mode?: unknown;
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

  try {
    const saved = await addScore({
      player: player.trim().slice(0, 24),
      score: Math.round(score),
      mode: mode as GameMode,
      daily: false,
    });
    return NextResponse.json({ entry: saved }, { status: 201 });
  } catch (e) {
    console.error("[scores] POST error", e);
    // Sin Redis en producción (Vercel) el disco es de solo lectura -> no persiste.
    return NextResponse.json(
      {
        error: usingRedis
          ? "No se pudo guardar en Redis."
          : "Ranking no configurado: falta un Redis (Vercel KV/Upstash).",
        storage: usingRedis ? "redis" : "file",
      },
      { status: 503 },
    );
  }
}
