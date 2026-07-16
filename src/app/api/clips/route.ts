import { NextResponse } from "next/server";
import { CLIPS, POSSIBLE_ANSWERS } from "@/lib/clips";

export const dynamic = "force-dynamic";

// GET /api/clips -> catálogo de clips + lista de respuestas posibles.
export async function GET() {
  return NextResponse.json({
    clips: CLIPS,
    possibleAnswers: POSSIBLE_ANSWERS,
  });
}
