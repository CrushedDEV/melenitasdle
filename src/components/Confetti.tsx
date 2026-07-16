"use client";

import { useEffect, useState } from "react";

const COLORS = ["#d14d4d", "#dd6666", "#ffffff", "#c9a13b", "#a7a3a3"];

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
  drift: number;
}

/** Ráfaga de confeti que se dispara cuando cambia `fire` (contador). */
export default function Confetti({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (fire <= 0) return;
    const next: Piece[] = Array.from({ length: 90 }, (_, i) => ({
      id: fire * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.35,
      duration: 1.8 + Math.random() * 1.4,
      rotate: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 160,
    }));
    setPieces(next);
    const t = window.setTimeout(() => setPieces([]), 3600);
    return () => window.clearTimeout(t);
  }, [fire]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 0.5}px`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--rot": `${p.rotate}deg`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
