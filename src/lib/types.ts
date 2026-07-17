// Tipos compartidos entre frontend y backend.

/** Plataforma de origen del clip. */
export type ClipType = "twitch" | "youtube";

/** Modo de juego: plataforma, mezcla, o la colección Plagios Dev. */
export type GameMode = "twitch" | "youtube" | "mixed" | "plagiosdev";

/** Colección a la que pertenece un clip. */
export type ClipCollection = "main" | "plagiosdev";

export interface Clip {
  /** Identificador único del clip. */
  id: string;
  /** Plataforma de origen. */
  type: ClipType;
  /** Colección: "main" (Twitch/YouTube/Mixto) o "plagiosdev". Por defecto "main". */
  collection?: ClipCollection;
  /** Respuesta correcta (lo que el jugador debe adivinar). */
  answer: string;
  /**
   * YouTube: id del vídeo/Short (la parte tras `watch?v=` o `/shorts/`).
   * Ej: para https://www.youtube.com/shorts/abc123 -> "abc123".
   */
  youtubeId?: string;
  /**
   * Twitch: id del VOD (vídeo) que contiene el momento del clip.
   * El reproductor de Twitch permite controlar play/pause/seek sobre VODs,
   * cosa que el embed de clip suelto no expone. Por eso referenciamos el VOD.
   * Ej: para https://www.twitch.tv/videos/123456789 -> "123456789".
   */
  twitchVideoId?: string;
  /**
   * Twitch: slug de un clip (clips.twitch.tv/SLUG o twitch.tv/canal/clip/SLUG).
   * Se resuelve a su MP4 vía /api/twitch-clip y se reproduce en un <video>
   * nativo, lo que permite control total (tramos, pausa y revelado).
   */
  twitchClipSlug?: string;
  /** Segundo de inicio del fragmento dentro del vídeo/VOD (por defecto 0). */
  start?: number;
}

export interface ScoreEntry {
  id: string;
  player: string;
  score: number;
  mode: GameMode;
  daily: boolean;
  createdAt: string; // ISO
}
