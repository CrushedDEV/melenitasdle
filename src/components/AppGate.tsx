"use client";

import { useEffect, useState } from "react";
import Game from "./Game";
import WordleGate from "./WordleGate";

const KEY = "melenitasdle:unlocked";

/**
 * Puerta de entrada: la primera vez muestra un Wordle (palabra: PLUSVALIA).
 * Al resolverlo se desbloquea el juego y se recuerda (localStorage), así que
 * las siguientes visitas entran directas.
 */
export default function AppGate() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(window.localStorage.getItem(KEY) === "1");
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!unlocked) {
    return (
      <WordleGate
        onSolved={() => {
          window.localStorage.setItem(KEY, "1");
          setUnlocked(true);
        }}
      />
    );
  }

  return <Game />;
}
