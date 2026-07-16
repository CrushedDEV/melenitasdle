"use client";

import { useMemo, useRef, useState } from "react";
import { normalize } from "@/lib/game";

interface Props {
  options: string[];
  disabled?: boolean;
  onGuess: (value: string) => void;
}

export default function GuessInput({ options, disabled, onGuess }: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = normalize(value);
    if (!q) return options;
    return options.filter((o) => normalize(o).includes(q));
  }, [value, options]);

  function choose(v: string) {
    setValue(v);
    setOpen(false);
    inputRef.current?.focus();
  }

  function submit() {
    const v = value.trim();
    if (!v) return;
    onGuess(v);
    setValue("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && matches[active]) {
        choose(matches[active]);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="guess">
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder="Escribe tu respuesta…"
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
      />
      {open && matches.length > 0 && !disabled && (
        <ul className="suggestions">
          {matches.map((m, i) => (
            <li
              key={m}
              ref={
                i === active
                  ? (el) => el?.scrollIntoView({ block: "nearest" })
                  : undefined
              }
              className={i === active ? "active" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(m);
              }}
              onMouseEnter={() => setActive(i)}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
