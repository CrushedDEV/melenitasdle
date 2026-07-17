"use client";

import { useEffect, useRef, useState } from "react";

const WORD = "PLUSVALIA"; // sin tilde: se teclea PLUSVALIA
const LEN = WORD.length;
const ROWS = 6;
const KEYS = ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"];

type TileStatus = "correct" | "present" | "absent" | "";
const RANK: Record<string, number> = { absent: 0, present: 1, correct: 2 };

function evaluate(guess: string): TileStatus[] {
  const res: TileStatus[] = Array(LEN).fill("absent");
  const counts: Record<string, number> = {};
  for (const ch of WORD) counts[ch] = (counts[ch] ?? 0) + 1;
  for (let i = 0; i < LEN; i++) {
    if (guess[i] === WORD[i]) {
      res[i] = "correct";
      counts[guess[i]]--;
    }
  }
  for (let i = 0; i < LEN; i++) {
    if (res[i] === "correct") continue;
    const ch = guess[i];
    if (counts[ch] > 0) {
      res[i] = "present";
      counts[ch]--;
    }
  }
  return res;
}

export default function WordleGate({ onSolved }: { onSolved: () => void }) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState(false);
  const [note, setNote] = useState("");

  // Lee siempre el estado directamente (sin funciones "updater" con efectos
  // secundarios dentro): en React 18 StrictMode esas se invocan dos veces en
  // desarrollo, lo que duplicaba la palabra en dos filas.
  function submit() {
    if (solved) return;
    if (current.length !== LEN) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    const guess = current;
    const nextGuesses = [...guesses, guess];
    setGuesses(nextGuesses);
    setCurrent("");
    setNote("");
    if (guess === WORD) {
      setSolved(true);
      setTimeout(onSolved, 1500);
    } else if (nextGuesses.length >= ROWS) {
      setNote("No era esa. Vuelve a intentarlo.");
      setTimeout(() => {
        setGuesses([]);
        setNote("");
      }, 1300);
    }
  }

  function type(ch: string) {
    if (solved || current.length >= LEN) return;
    setNote("");
    setCurrent(current + ch);
  }

  function del() {
    if (current.length === 0) return;
    setCurrent(current.slice(0, -1));
  }

  // El listener de teclado se registra UNA sola vez; siempre llama a la
  // versión más reciente de submit/type/del a través de esta ref.
  const latest = useRef({ submit, type, del, solved });
  latest.current = { submit, type, del, solved };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { submit, type, del, solved } = latest.current;
      if (solved) return;
      if (e.key === "Enter") submit();
      else if (e.key === "Backspace") del();
      else {
        const ch = e.key.toUpperCase();
        if (/^[A-ZÑ]$/.test(ch)) type(ch);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Color de cada tecla según los intentos.
  const keyStatus: Record<string, TileStatus> = {};
  for (const g of guesses) {
    const ev = evaluate(g);
    for (let i = 0; i < LEN; i++) {
      const ch = g[i];
      const s = ev[i];
      if (!keyStatus[ch] || RANK[s] > RANK[keyStatus[ch]]) keyStatus[ch] = s;
    }
  }

  return (
    <div className="wordle">
      <div className="wordle-head">
        <span className="kicker">Acceso</span>
        <h1>Adivina la palabra</h1>
        <p>
          Resuelve el Wordle para desbloquear <strong>Melenitasdle</strong>.
          <br />
          Pista: término económico · {LEN} letras.
        </p>
      </div>

      <div className={`wordle-grid ${shake ? "shake" : ""}`}>
        {Array.from({ length: ROWS }).map((_, r) => {
          const g = guesses[r];
          const isCurrent = r === guesses.length && !solved;
          const ev = g ? evaluate(g) : null;
          return (
            <div className="wordle-row" key={r}>
              {Array.from({ length: LEN }).map((_, c) => {
                const ch = g ? g[c] : isCurrent ? current[c] : undefined;
                const st = ev ? ev[c] : "";
                return (
                  <div
                    key={c}
                    className={`tile ${st} ${ch && !g ? "filled" : ""}`}
                  >
                    {ch ?? ""}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {solved ? (
        <div className="wordle-win">¡Correcto! Desbloqueando…</div>
      ) : note ? (
        <div className="wordle-note">{note}</div>
      ) : (
        <div className="wordle-note" />
      )}

      <div className="keyboard">
        {KEYS.map((row, ri) => (
          <div className="kb-row" key={ri}>
            {ri === 2 && (
              <button className="key wide" onClick={submit}>
                Enter
              </button>
            )}
            {row.split("").map((k) => (
              <button
                key={k}
                className={`key ${keyStatus[k] ?? ""}`}
                onClick={() => type(k)}
              >
                {k}
              </button>
            ))}
            {ri === 2 && (
              <button className="key wide" onClick={del}>
                Borrar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
