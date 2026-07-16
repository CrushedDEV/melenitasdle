"use client";

import { useEffect, useRef, useState } from "react";

/** Elige dos vídeos al azar (distintos si hay suficientes). */
function pickTwo(list: string[]): [string, string] | null {
  if (list.length === 0) return null;
  if (list.length === 1) return [list[0], list[0]];
  const a = Math.floor(Math.random() * list.length);
  let b = Math.floor(Math.random() * list.length);
  if (b === a) b = (b + 1) % list.length;
  return [list[a], list[b]];
}

/**
 * Modo dopamina: dos vídeos verticales que entran desde los lados con animación,
 * en bucle y sin sonido. Al desactivar salen por donde entraron.
 *
 * Los vídeos se montan (fuera de pantalla) y se PRECARGAN en cuanto hay lista,
 * antes de pulsar el botón: así la animación de entrada es instantánea y no se
 * ve el negro inicial. Cada vez que se cierra se prepara un par nuevo aleatorio
 * (que queda precargado para la siguiente activación).
 */
export default function DopamineMode({
  active,
  videos,
}: {
  active: boolean;
  videos: string[];
}) {
  const [picks, setPicks] = useState<[string, string] | null>(null);
  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef(active);
  const wasActive = useRef(false);
  activeRef.current = active;

  // Elige el primer par en cuanto llega la lista (para precargarlo ya).
  useEffect(() => {
    if (videos.length && !picks) setPicks(pickTwo(videos));
  }, [videos, picks]);

  useEffect(() => {
    if (active) {
      leftRef.current?.play().catch(() => {});
      rightRef.current?.play().catch(() => {});
      wasActive.current = true;
    } else {
      // Tras la animación de salida: pausa y prepara un par nuevo (precargado).
      const t = window.setTimeout(() => {
        leftRef.current?.pause();
        rightRef.current?.pause();
        if (wasActive.current && videos.length) setPicks(pickTwo(videos));
      }, 650);
      return () => window.clearTimeout(t);
    }
  }, [active, videos]);

  // Decodifica el primer frame en segundo plano (evita el flash negro).
  function warm(el: HTMLVideoElement | null) {
    if (!el) return;
    el
      .play()
      .then(() => {
        if (!activeRef.current) el.pause();
      })
      .catch(() => {});
  }

  if (!picks) return null;

  return (
    <div className={`dopamine ${active ? "active" : ""}`} aria-hidden="true">
      <div className="dopa-vid left">
        <video
          ref={leftRef}
          src={picks[0]}
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={(e) => warm(e.currentTarget)}
        />
      </div>
      <div className="dopa-vid right">
        <video
          ref={rightRef}
          src={picks[1]}
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={(e) => warm(e.currentTarget)}
        />
      </div>
    </div>
  );
}
