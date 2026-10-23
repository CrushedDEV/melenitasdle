"use client";

import { useEffect, useState } from "react";
import type { ScoreEntry } from "@/lib/types";
import { SpinnerIcon, TrophyIcon } from "./Icon";

const MODE_LABEL: Record<string, string> = {
  twitch: "Twitch",
  youtube: "YouTube",
  mixed: "Mixto",
  plagiosdev: "Plagios Dev",
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
      <div className="lb-head">
        <span className="side-label">cara B</span>
        <h3>
          <span className="lb-title">
            <TrophyIcon size={15} /> Los que más saben
          </span>
        </h3>
      </div>
      {loading ? (
        <p className="muted center statusline">
          <SpinnerIcon size={16} /> Cargando…
        </p>
      ) : scores.length === 0 ? (
        <p className="lb-empty">
          La tracklist está vacía. La primera canción la pones tú.
        </p>
      ) : (
        <ol className="lb-list">
          {scores.map((s, i) => (
            <li className="lb-row" key={s.id}>
              <span className="rank">{String(i + 1).padStart(2, "0")}</span>
              <span className="lb-name">
                {s.player}
                <small>{MODE_LABEL[s.mode] ?? s.mode}</small>
              </span>
              <span className="lb-dots" aria-hidden="true" />
              <span className="pts">{s.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
