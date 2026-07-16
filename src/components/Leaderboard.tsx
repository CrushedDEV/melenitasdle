"use client";

import { useEffect, useState } from "react";
import type { ScoreEntry } from "@/lib/types";
import { SpinnerIcon, TrophyIcon } from "./Icon";

const MODE_LABEL: Record<string, string> = {
  twitch: "Twitch",
  youtube: "YouTube",
  mixed: "Mixto",
};

export default function Leaderboard({ refreshKey }: { refreshKey: number }) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/scores?limit=10")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setScores(d.scores ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="leaderboard">
      <h3>
        <span className="lb-title">
          <TrophyIcon size={16} /> Mejores puntuaciones
        </span>
      </h3>
      {loading ? (
        <p className="muted center statusline">
          <SpinnerIcon size={16} /> Cargando…
        </p>
      ) : scores.length === 0 ? (
        <p className="muted center">Aún no hay puntuaciones. ¡Sé el primero!</p>
      ) : (
        scores.map((s, i) => (
          <div className="lb-row" key={s.id}>
            <span className="rank">#{i + 1}</span>
            <span>{s.player}</span>
            <span className="tag">
              {MODE_LABEL[s.mode] ?? s.mode}
              {s.daily ? " · diario" : ""}
            </span>
            <span className="pts">{s.score}</span>
          </div>
        ))
      )}
    </div>
  );
}
