import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogv"]);

// GET /api/dopamine -> { videos: string[] }  (vídeos de public/dopamina)
export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "dopamina");
    const files = await fs.readdir(dir);
    const videos = files
      .filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase()))
      .map((f) => `/dopamina/${encodeURIComponent(f)}`);
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
