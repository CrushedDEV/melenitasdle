"use client";

import { useEffect, useRef, useState } from "react";

// Vídeos del modo dopamina (YouTube). Añade/edita IDs aquí.
const YT_IDS = ["XBIaqOm0RKQ", "i0M4ARe9v0Y"];

/** Elige dos vídeos (distintos si hay suficientes). */
function pickTwo(list: string[]): [string, string] | null {
  if (list.length === 0) return null;
  if (list.length === 1) return [list[0], list[0]];
  const a = Math.floor(Math.random() * list.length);
  let b = Math.floor(Math.random() * list.length);
  if (b === a) b = (b + 1) % list.length;
  return [list[a], list[b]];
}

function embedSrc(id: string): string {
  const p = new URLSearchParams({
    enablejsapi: "1",
    autoplay: "0",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    disablekb: "1",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    fs: "0",
  });
  return `https://www.youtube.com/embed/${id}?${p.toString()}`;
}

function command(iframe: HTMLIFrameElement | null, func: "playVideo" | "pauseVideo") {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args: [] }),
    "*",
  );
}

/**
 * Modo dopamina: dos vídeos verticales de YouTube que entran desde los lados,
 * en bucle y sin sonido. Los iframes se montan (y precargan el reproductor) al
 * cargar la página; se reproducen al activar y se pausan al salir, así la
 * animación de entrada es instantánea y no gastan datos mientras están ocultos.
 */
export default function DopamineMode({ active }: { active: boolean }) {
  const [picks, setPicks] = useState<[string, string] | null>(null);
  const leftRef = useRef<HTMLIFrameElement>(null);
  const rightRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setPicks(pickTwo(YT_IDS));
  }, []);

  useEffect(() => {
    if (!picks) return;
    if (active) {
      // Reintenta el play unas veces por si el reproductor aún no está listo.
      let n = 0;
      const send = () => {
        command(leftRef.current, "playVideo");
        command(rightRef.current, "playVideo");
        if (++n < 6) window.setTimeout(send, 220);
      };
      send();
    } else {
      const t = window.setTimeout(() => {
        command(leftRef.current, "pauseVideo");
        command(rightRef.current, "pauseVideo");
      }, 600);
      return () => window.clearTimeout(t);
    }
  }, [active, picks]);

  if (!picks) return null;

  return (
    <div className={`dopamine ${active ? "active" : ""}`} aria-hidden="true">
      <div className="dopa-vid left">
        <iframe
          ref={leftRef}
          src={embedSrc(picks[0])}
          title=""
          allow="autoplay; encrypted-media"
          frameBorder="0"
        />
      </div>
      <div className="dopa-vid right">
        <iframe
          ref={rightRef}
          src={embedSrc(picks[1])}
          title=""
          allow="autoplay; encrypted-media"
          frameBorder="0"
        />
      </div>
    </div>
  );
}
