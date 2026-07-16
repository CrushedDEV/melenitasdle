import type { Clip, GameMode } from "./types";

/** Duración (en segundos) desbloqueada en cada intento. Heardle clásico. */
export const DURATIONS = [0.5, 1, 2, 4, 8, 16] as const;

/** Número máximo de intentos (= número de tramos de duración). */
export const MAX_ATTEMPTS = DURATIONS.length;

/** Filtra los clips según el modo de juego elegido. */
export function clipsForMode(clips: Clip[], mode: GameMode): Clip[] {
  if (mode === "mixed") return clips;
  return clips.filter((c) => c.type === mode);
}

/**
 * Puntos obtenidos al acertar.
 * Cuantos menos intentos uses, más puntos: 1er intento = 600, ... último = 100.
 * `attemptIndex` es 0-based (0 = primer intento).
 */
export function scoreForAttempt(attemptIndex: number): number {
  return (MAX_ATTEMPTS - attemptIndex) * 100;
}

/**
 * Selección determinista para el "modo diario": el mismo día siempre devuelve
 * el mismo clip para todos los jugadores.
 */
export function dailyClip<T>(items: T[], date = new Date()): T {
  const key =
    date.getUTCFullYear() * 10000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate();
  // Hash sencillo y estable.
  let h = key;
  h = (h ^ (h >>> 15)) >>> 0;
  h = (h * 0x2545f491) >>> 0;
  return items[h % items.length];
}

/** Elige un elemento aleatorio. */
export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Elige un segundo de inicio aleatorio "por el medio" del vídeo, dejando hueco
 * para el tramo de audio más largo. Si no se conoce la duración, empieza a 0.
 */
export function randomStart(duration: number, maxReveal: number): number {
  if (!duration || duration <= maxReveal + 3) return 0;
  const min = Math.max(2, duration * 0.1);
  const max = Math.max(min, duration - maxReveal - 1);
  return Math.floor(min + Math.random() * (max - min));
}

/** Normaliza texto para comparar respuestas (sin acentos, minúsculas, sin signos). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Compara la respuesta del jugador con la correcta. */
export function isCorrectGuess(guess: string, answer: string): boolean {
  return normalize(guess) === normalize(answer);
}
