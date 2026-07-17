// Persistencia de puntuaciones.
//
// Guarda UNA entrada por jugador (la de mayor puntuación). Así se puede
// autoguardar en cada ronda sin llenar el ranking de duplicados.
//
// Dos backends automáticos:
//  1) Redis REST (Vercel KV / Upstash) si hay credenciales -> producción.
//     El sistema de archivos de Vercel es SOLO LECTURA, por eso en producción
//     hace falta un Redis. Se usa un HASH: campo = jugador, valor = JSON.
//  2) Fichero JSON local (data/scores.json) como fallback en desarrollo.
//
// Variables de entorno (Vercel las crea al conectar el store):
//   KV_REST_API_URL / KV_REST_API_TOKEN            (Vercel KV / Redis)
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN  (Upstash)

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
    throw new Error(`Redis REST ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { result: T };
  return data.result;
}

// HGETALL puede volver como objeto {campo:valor} o como array [c,v,c,v,...].
function hashToMap(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  if (Array.isArray(raw)) {
    for (let i = 0; i + 1 < raw.length; i += 2) {
      out[String(raw[i])] = String(raw[i + 1]);
    }
  } else if (typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      out[k] = String(v);
    }
  }
  return out;
}

/* -------------------------- Fichero (fallback) ------------------------- */

const DATA_DIR = path.join(process.cwd(), "data");
const SCORES_FILE = path.join(DATA_DIR, "scores.json");

async function readFileMap(): Promise<Record<string, ScoreEntry>> {
  try {
    const raw = await fs.readFile(SCORES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Formato antiguo (lista): lo colapsamos por jugador (máximo).
      const map: Record<string, ScoreEntry> = {};
      for (const e of parsed as ScoreEntry[]) {
        const k = nameKey(e.player);
        if (!map[k] || e.score > map[k].score) map[k] = e;
      }
      return map;
    }
    return (parsed ?? {}) as Record<string, ScoreEntry>;
  } catch {
    return {};
  }
}

async function writeFileMap(map: Record<string, ScoreEntry>): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SCORES_FILE, JSON.stringify(map, null, 2), "utf8");
}

/* ------------------------------- Helpers ------------------------------- */

function nameKey(player: string): string {
  return player.trim().toLowerCase();
}

async function readMap(): Promise<Record<string, ScoreEntry>> {
  if (usingRedis) {
    const raw = await redis(["HGETALL", KEY]);
    const h = hashToMap(raw);
    const out: Record<string, ScoreEntry> = {};
    for (const [player, json] of Object.entries(h)) {
      try {
        out[player] = JSON.parse(json) as ScoreEntry;
      } catch {
        /* ignora entradas corruptas */
      }
    }
    return out;
  }
  return readFileMap();
}

/* ------------------------------- API ----------------------------------- */

export async function readScores(): Promise<ScoreEntry[]> {
  const map = await readMap();
  return Object.values(map);
}

/**
 * Guarda la puntuación del jugador quedándose con la MÁS ALTA (upsert).
 * Devuelve la entrada vigente (la nueva o la anterior si era mayor).
 */
export async function addScore(
  entry: Omit<ScoreEntry, "id" | "createdAt">,
): Promise<ScoreEntry> {
  const key = nameKey(entry.player);
  const full: ScoreEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  const map = await readMap();
  const existing = map[key];
  if (existing && existing.score >= full.score) return existing;

  if (usingRedis) {
    await redis(["HSET", KEY, key, JSON.stringify(full)]);
  } else {
    map[key] = full;
    await writeFileMap(map);
  }
  return full;
}

/** Top puntuaciones ordenadas de mayor a menor. */
export async function topScores(limit = 10): Promise<ScoreEntry[]> {
  const all = await readScores();
  return all.sort((a, b) => b.score - a.score).slice(0, limit);
}
