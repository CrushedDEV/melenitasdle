// Persistencia de puntuaciones.
//
// Dos backends, se elige automáticamente:
//  1) Redis REST (Vercel KV o Upstash) si hay credenciales en variables de
//     entorno. Es lo que se usa en producción (Vercel) porque el sistema de
//     archivos de las funciones serverless es de SOLO LECTURA.
//  2) Fichero JSON local (`data/scores.json`) como fallback para desarrollo
//     (`npm run dev`).
//
// Para activar el modo Redis en Vercel, define las variables (la integración
// de Vercel KV / Upstash las crea por ti):
//   KV_REST_API_URL / KV_REST_API_TOKEN            (Vercel KV)
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN  (Upstash directo)

import { promises as fs } from "fs";
import path from "path";
import type { ScoreEntry } from "./types";

const KEY = "melenitasdle:scores";

const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const usingRedis = Boolean(REDIS_URL && REDIS_TOKEN);

/* ----------------------------- Redis (REST) ---------------------------- */

async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Redis REST error ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { result: T };
  return data.result;
}

/* -------------------------- Fichero (fallback) ------------------------- */

const DATA_DIR = path.join(process.cwd(), "data");
const SCORES_FILE = path.join(DATA_DIR, "scores.json");

async function readFileScores(): Promise<ScoreEntry[]> {
  try {
    const raw = await fs.readFile(SCORES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeFileScores(all: ScoreEntry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SCORES_FILE, JSON.stringify(all, null, 2), "utf8");
}

/* ------------------------------- API ----------------------------------- */

export async function readScores(): Promise<ScoreEntry[]> {
  if (usingRedis) {
    const raw = await redis<string[]>(["LRANGE", KEY, 0, -1]);
    return (raw ?? []).map((s) => JSON.parse(s) as ScoreEntry);
  }
  return readFileScores();
}

export async function addScore(
  entry: Omit<ScoreEntry, "id" | "createdAt">,
): Promise<ScoreEntry> {
  const full: ScoreEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  if (usingRedis) {
    await redis(["RPUSH", KEY, JSON.stringify(full)]);
    return full;
  }

  const all = await readFileScores();
  all.push(full);
  await writeFileScores(all);
  return full;
}

/** Top puntuaciones ordenadas de mayor a menor. */
export async function topScores(limit = 10): Promise<ScoreEntry[]> {
  const all = await readScores();
  return all.sort((a, b) => b.score - a.score).slice(0, limit);
}
