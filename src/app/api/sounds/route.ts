import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const AUDIO_EXT = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".webm"]);

async function listAudio(dir: string, urlBase: string): Promise<string[]> {
  try {
    const files = await fs.readdir(path.join(process.cwd(), "public", dir));
    return files
      .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
      .map((f) => `${urlBase}/${encodeURIComponent(f)}`);
  } catch {
    return [];
  }
}

// GET /api/sounds -> { aciertos: string[], fallos: string[], risedev: string|null }
export async function GET() {
  const [aciertos, fallos, root] = await Promise.all([
    listAudio("sounds/aciertos", "/sounds/aciertos"),
    listAudio("sounds/fallos", "/sounds/fallos"),
    listAudio("sounds", "/sounds"),
  ]);

  // Sonido del botón RiseDev: cualquier archivo llamado "risedev.*" en /sounds.
  const risedev =
    root.find((u) => /\/risedev\.[^/]+$/i.test(decodeURIComponent(u))) ?? null;

  return NextResponse.json({ aciertos, fallos, risedev });
}
