import type { Clip } from "./types";
import { resolveClips, type RawClip } from "./parse";

/**
 * TUS CLIPS.
 *
 * Añade cada clip pegando su URL y la respuesta correcta. La plataforma
 * (YouTube o Twitch) se detecta sola a partir de la URL.
 *
 *   { url: "https://www.youtube.com/shorts/XXXX", answer: "Nombre del momento" }
 *
 * Formatos de URL admitidos:
 *   YouTube:  youtube.com/watch?v=ID · youtu.be/ID · youtube.com/shorts/ID
 *   Twitch:   twitch.tv/videos/VOD_ID   (VOD, necesario para el audio por tramos)
 *
 * Inicio del fragmento:
 *   - Se coge del parámetro `t` de la URL si existe (?t=90, ?t=1m30s, ?t=1h2m3s).
 *   - O puedes fijarlo con `start` en segundos: { url, answer, start: 642 }.
 *
 * Nota Twitch: un "clip" suelto (clips.twitch.tv/SLUG) NO permite controlar el
 * audio de forma progresiva. Usa la URL del VOD (twitch.tv/videos/ID) e indica
 * el segundo del momento con `t=` o `start`.
 *
 * Los ejemplos de abajo son de relleno: sustitúyelos por los tuyos.
 */
const RAW_CLIPS: RawClip[] = [
  {
    url: "https://www.youtube.com/shorts/yeRiKHjAN14",
    answer: "publi. He PROGRAMADO un SISTEMA de MISIONES para mi videojuego",
  },
    {
    url: "https://www.twitch.tv/melenitasdev/clip/GrotesqueElatedSkirretTF2John-9Cs4jKCBa5-wqu_g",
    answer: "Cancelación definitiva final final esta vez si.mp4",
  },

];

export const CLIPS: Clip[] = resolveClips(RAW_CLIPS);

/**
 * Respuestas posibles para el autocompletado. Por defecto son las respuestas
 * correctas del catálogo (sin duplicados). Añade distractores extra si quieres.
 */
export const POSSIBLE_ANSWERS: string[] = Array.from(
  new Set(CLIPS.map((c) => c.answer)),
).sort((a, b) => a.localeCompare(b, "es"));
