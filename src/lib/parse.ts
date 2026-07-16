import type { Clip, ClipType } from "./types";

/** Convierte "90", "90s", "1m30s", "1h2m3s" a segundos. */
export function parseTimeToSeconds(t: string | null | undefined): number | undefined {
  if (!t) return undefined;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  if (!m) return undefined;
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  const total = h * 3600 + min * 60 + s;
  return total > 0 ? total : undefined;
}

/** Extrae el id de vídeo de una URL de YouTube (watch, youtu.be, shorts, embed). */
export function parseYouTube(
  url: string,
): { id: string; start?: number } | null {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1).split("/")[0];
    } else if (u.pathname.startsWith("/shorts/")) {
      id = u.pathname.split("/")[2] ?? "";
    } else if (u.pathname.startsWith("/embed/")) {
      id = u.pathname.split("/")[2] ?? "";
    } else {
      id = u.searchParams.get("v") ?? "";
    }
    if (!id) return null;
    const start = parseTimeToSeconds(
      u.searchParams.get("t") || u.searchParams.get("start"),
    );
    return { id, start };
  } catch {
    return null;
  }
}

/**
 * Extrae datos de una URL de Twitch.
 * Soporta VODs (twitch.tv/videos/ID) — necesarios para el revelado progresivo.
 * También detecta clips (clips.twitch.tv/SLUG o twitch.tv/canal/clip/SLUG) para
 * poder avisar de que hace falta el VOD.
 */
export function parseTwitch(
  url: string,
): { videoId?: string; clipSlug?: string; start?: number } | null {
  try {
    const u = new URL(url);
    const start = parseTimeToSeconds(u.searchParams.get("t"));
    const vod = u.pathname.match(/\/videos\/(\d+)/);
    if (vod) return { videoId: vod[1], start };
    if (u.hostname.includes("clips.twitch.tv")) {
      return { clipSlug: u.pathname.slice(1).split("/")[0], start };
    }
    const clip = u.pathname.match(/\/clip\/([^/?#]+)/);
    if (clip) return { clipSlug: clip[1], start };
    return null;
  } catch {
    return null;
  }
}

/** Detecta la plataforma a partir de la URL. */
export function detectType(url: string): ClipType | null {
  const l = url.toLowerCase();
  if (l.includes("youtube.com") || l.includes("youtu.be")) return "youtube";
  if (l.includes("twitch.tv")) return "twitch";
  return null;
}

export interface RawClip {
  id?: string;
  /** URL del clip (YouTube/Short o VOD de Twitch). */
  url: string;
  /** Respuesta correcta que el jugador debe adivinar. */
  answer: string;
  /** Segundo de inicio (opcional; si la URL trae `t=` se usa esa). */
  start?: number;
  /** Fuerza la plataforma; normalmente se deduce de la URL. */
  type?: ClipType;
}

/**
 * Resuelve una definición cruda (URL + respuesta) a un Clip listo para jugar.
 * Devuelve `null` (y avisa por consola) si la URL no es válida o es un clip de
 * Twitch sin VOD (no se puede controlar el audio de forma progresiva).
 */
export function resolveClip(raw: RawClip, index: number): Clip | null {
  const type = raw.type ?? detectType(raw.url);
  const id = raw.id ?? `clip-${index + 1}`;

  if (type === "youtube") {
    const yt = parseYouTube(raw.url);
    if (!yt) {
      console.warn(`[clips] URL de YouTube no válida: ${raw.url}`);
      return null;
    }
    return {
      id,
      type: "youtube",
      answer: raw.answer,
      youtubeId: yt.id,
      start: raw.start ?? yt.start ?? 0,
    };
  }

  if (type === "twitch") {
    const tw = parseTwitch(raw.url);
    if (!tw) {
      console.warn(`[clips] URL de Twitch no válida: ${raw.url}`);
      return null;
    }
    if (tw.videoId) {
      return {
        id,
        type: "twitch",
        answer: raw.answer,
        twitchVideoId: tw.videoId,
        start: raw.start ?? tw.start ?? 0,
      };
    }
    if (tw.clipSlug) {
      return {
        id,
        type: "twitch",
        answer: raw.answer,
        twitchClipSlug: tw.clipSlug,
        start: raw.start ?? tw.start ?? 0,
      };
    }
    console.warn(`[clips] URL de Twitch no reconocida: ${raw.url}`);
    return null;
  }

  console.warn(`[clips] No se reconoce la plataforma de: ${raw.url}`);
  return null;
}

/** Resuelve una lista de definiciones, descartando las inválidas. */
export function resolveClips(raws: RawClip[]): Clip[] {
  return raws
    .map((r, i) => resolveClip(r, i))
    .filter((c): c is Clip => c !== null);
}
