"use client";

import { CheckIcon, CloseIcon } from "./Icon";

export interface PollOption {
  letter: string;
  text: string;
  correct: boolean;
}

interface Props {
  options: PollOption[];
  counts: number[];
  revealed: boolean;
  /** Índice de la opción más votada (-1 si no hay votos). */
  winner: number;
}

export default function StreamerPoll({
  options,
  counts,
  revealed,
  winner,
}: Props) {
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div className={`poll ${revealed ? "revealed" : ""}`}>
      {options.map((o, i) => {
        const votes = counts[i] ?? 0;
        const pct = total > 0 ? (votes / total) * 100 : 0;
        const leading = i === winner && total > 0;

        let state = "";
        if (revealed) {
          if (o.correct) state = "correct";
          else if (leading) state = "wrong";
          else state = "dim";
        } else if (leading) {
          state = "leading";
        }

        return (
          <div className={`poll-opt ${state}`} key={o.letter}>
            <span className="poll-letter">{o.letter}</span>
            <div className="poll-main">
              <div className="poll-line">
                <span className="poll-text">{o.text}</span>
                <span className="poll-count">
                  {votes}
                  <small>{total > 0 ? ` · ${Math.round(pct)}%` : ""}</small>
                </span>
              </div>
              <div className="poll-bar">
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
            {revealed && o.correct && (
              <span className="poll-mark ok">
                <CheckIcon size={18} />
              </span>
            )}
            {revealed && !o.correct && leading && (
              <span className="poll-mark no">
                <CloseIcon size={18} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
