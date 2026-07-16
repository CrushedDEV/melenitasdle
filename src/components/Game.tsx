"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Clip, GameMode } from "@/lib/types";
import {
  DURATIONS,
  MAX_ATTEMPTS,
  clipsForMode,
  dailyClip,
  isCorrectGuess,
  randomItem,
  randomStart,
  scoreForAttempt,
} from "@/lib/game";
import { createPlayer, type ClipPlayer } from "@/lib/players";
import GuessInput from "./GuessInput";
import Leaderboard from "./Leaderboard";
import Toasts, { useToasts } from "./Toasts";
import Confetti from "./Confetti";
import DopamineMode from "./DopamineMode";
import {
  playError,
  playFile,
  playRandom,
  playSuccess,
  setSfxMuted,
  setSfxVolume,
} from "@/lib/sfx";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  DotIcon,
  GamepadIcon,
  PlayIcon,
  SaveIcon,
  SkipIcon,
  SpinnerIcon,
  TrophyIcon,
  VolumeIcon,
  VolumeMuteIcon,
  ZapIcon,
} from "./Icon";

type Status = "loading" | "error" | "ready" | "playing" | "won" | "lost";
type SaveState = "idle" | "saving" | "saved" | "error";

interface Attempt {
  kind: "wrong" | "skip" | "correct";
  text?: string;
}

const MODES: { id: GameMode; label: string }[] = [
  { id: "mixed", label: "Mixto" },
  { id: "twitch", label: "Twitch" },
  { id: "youtube", label: "YouTube" },
];

const MAX_SECONDS = DURATIONS[DURATIONS.length - 1];

export default function Game() {
  const [allClips, setAllClips] = useState<Clip[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [mode, setMode] = useState<GameMode>("mixed");
  const [daily, setDaily] = useState(false);

  const [clip, setClip] = useState<Clip | null>(null);
  const [roundId, setRoundId] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [playing, setPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const [totalScore, setTotalScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);

  const [playerName, setPlayerName] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lbKey, setLbKey] = useState(0);

  const [feedback, setFeedback] = useState<"error" | "success" | null>(null);
  const [confettiFire, setConfettiFire] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [sounds, setSounds] = useState<{
    aciertos: string[];
    fallos: string[];
    risedev: string | null;
  }>({ aciertos: [], fallos: [], risedev: null });

  const [dopamine, setDopamine] = useState(false);
  const [dopamineVideos, setDopamineVideos] = useState<string[]>([]);
  const [clipVolume, setClipVolume] = useState(0.8);
  const [sfxVolume, setSfxVolumeState] = useState(0.7);

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ClipPlayer | null>(null);
  const segmentStartRef = useRef(0);
  const clipVolumeRef = useRef(0.8);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toasts, notify } = useToasts();

  /* --------------------------- sonido (sfx) ----------------------------- */
  useEffect(() => {
    const saved = window.localStorage.getItem("melenitasdle:sound");
    const on = saved === null ? true : saved === "1";
    setSoundOn(on);
    setSfxMuted(!on);
  }, []);

  // Lista de sonidos de las carpetas public/sounds/{aciertos,fallos}.
  useEffect(() => {
    fetch("/api/sounds")
      .then((r) => r.json())
      .then((d) =>
        setSounds({
          aciertos: d.aciertos ?? [],
          fallos: d.fallos ?? [],
          risedev: d.risedev ?? null,
        }),
      )
      .catch(() => {});
    fetch("/api/dopamine")
      .then((r) => r.json())
      .then((d) => setDopamineVideos(d.videos ?? []))
      .catch(() => {});
  }, []);

  // Volúmenes guardados (clips y efectos).
  useEffect(() => {
    const cv = Number(window.localStorage.getItem("melenitasdle:vol:clips"));
    const sv = Number(window.localStorage.getItem("melenitasdle:vol:sfx"));
    if (Number.isFinite(cv) && cv >= 0 && cv <= 1) {
      setClipVolume(cv);
      clipVolumeRef.current = cv;
    }
    if (Number.isFinite(sv) && sv >= 0 && sv <= 1) {
      setSfxVolumeState(sv);
      setSfxVolume(sv);
    }
  }, []);

  function changeClipVolume(v: number) {
    setClipVolume(v);
    clipVolumeRef.current = v;
    playerRef.current?.setVolume(v);
    window.localStorage.setItem("melenitasdle:vol:clips", String(v));
  }

  function changeSfxVolume(v: number) {
    setSfxVolumeState(v);
    setSfxVolume(v);
    window.localStorage.setItem("melenitasdle:vol:sfx", String(v));
  }

  function toggleSound() {
    setSoundOn((prev) => {
      const next = !prev;
      setSfxMuted(!next);
      window.localStorage.setItem("melenitasdle:sound", next ? "1" : "0");
      return next;
    });
  }

  // Solo efecto visual (shake / pulso). El sonido se decide en cada caso.
  function flashFeedback(kind: "error" | "success") {
    setFeedback(kind);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 700);
  }

  // Acierto de ronda: confeti + sonido aleatorio de /aciertos (o sintético).
  function winFeedback() {
    flashFeedback("success");
    setConfettiFire((c) => c + 1);
    if (!playRandom(sounds.aciertos)) playSuccess();
  }

  // Fin de ronda perdida: sonido aleatorio de /fallos (o sintético).
  function loseFeedback() {
    flashFeedback("error");
    if (!playRandom(sounds.fallos)) playError();
  }

  // Fallo intermedio (aún quedan intentos): solo shake + zumbido corto.
  function wrongFeedback() {
    flashFeedback("error");
    playError();
  }

  /* -------------------------- carga de catálogo ------------------------- */
  const loadCatalog = useCallback(() => {
    setStatus("loading");
    fetch("/api/clips")
      .then((r) => {
        if (!r.ok) throw new Error("Respuesta no válida del servidor");
        return r.json();
      })
      .then((d) => {
        setAllClips(d.clips ?? []);
        setStatus("ready");
      })
      .catch(() => {
        setStatus("error");
        notify("error", "No se pudieron cargar los clips");
      });
  }, [notify]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Respuestas del autocompletado SOLO del modo activo (Twitch/YouTube/Mixto).
  const modeAnswers = useMemo(() => {
    const set = new Set(clipsForMode(allClips, mode).map((c) => c.answer));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [allClips, mode]);

  const pool = useCallback(
    () => clipsForMode(allClips, mode),
    [allClips, mode],
  );

  /* --------------------- crear/destruir reproductor --------------------- */
  // Se recrea en cada ronda (roundId), aunque toque el mismo clip: así se para
  // la reproducción anterior y se elige un nuevo segundo de inicio aleatorio.
  useEffect(() => {
    if (!clip || !hostRef.current) return;
    setPlayerReady(false);
    segmentStartRef.current = 0;
    hostRef.current.innerHTML = "";
    const mount = document.createElement("div");
    mount.style.width = "100%";
    mount.style.height = "100%";
    hostRef.current.appendChild(mount);

    let cancelled = false;
    let player: ClipPlayer | null = null;
    try {
      player = createPlayer(clip, mount);
      playerRef.current = player;
      player.ready
        .then(async () => {
          if (cancelled) return;
          // Segundo aleatorio "por el medio" del vídeo.
          let duration = 0;
          try {
            duration = await player!.getDuration();
          } catch {
            /* sin duración: empezará a 0 */
          }
          if (cancelled) return;
          segmentStartRef.current = randomStart(duration, MAX_SECONDS);
          player!.setVolume(clipVolumeRef.current);
          setPlayerReady(true);
        })
        .catch(() => {
          if (!cancelled) notify("error", "Error al preparar el audio del clip");
        });
    } catch (e) {
      console.error(e);
      notify("error", "No se pudo inicializar el reproductor");
    }
    return () => {
      cancelled = true;
      player?.destroy();
      if (playerRef.current === player) playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip, roundId]);

  /* ------------------------------- rondas ------------------------------- */
  function startRound() {
    if (!playerName.trim()) return;
    const candidates = pool();
    if (candidates.length === 0) return;
    const next = daily ? dailyClip(candidates) : randomItem(candidates);
    // Detiene cualquier reproducción en curso (p. ej. el clip completo revelado).
    playerRef.current?.stop();
    setClip(next);
    setRoundId((r) => r + 1);
    setAttempts([]);
    setStatus("playing");
    setLastPoints(0);
    setSaveState("idle");
    setPlaying(false);
  }

  const currentIndex = Math.min(attempts.length, MAX_ATTEMPTS - 1);
  const finished = status === "won" || status === "lost";
  const unlockedSeconds = finished ? MAX_SECONDS : DURATIONS[currentIndex];

  async function playClip() {
    const p = playerRef.current;
    if (!p || !playerReady) return;
    const seconds = DURATIONS[currentIndex];
    setPlaying(true);
    try {
      await p.play(seconds, segmentStartRef.current);
    } catch (e) {
      console.error(e);
      notify("error", "No se pudo reproducir el audio");
    }
    window.setTimeout(() => setPlaying(false), seconds * 1000);
  }

  // Reproduce el clip/vídeo completo (revelado al terminar la ronda).
  function playFull() {
    const p = playerRef.current;
    if (!p) return;
    setPlaying(true);
    p.playFull().catch((e) => {
      console.error(e);
      notify("error", "No se pudo reproducir el clip completo");
    });
  }

  function endRound(result: "won" | "lost", points: number) {
    setStatus(result);
    setLastPoints(points);
    setTotalScore((s) => s + points);
    setRounds((r) => r + 1);
    // Revela y reproduce el clip entero.
    playFull();
  }

  function handleGuess(value: string) {
    if (status !== "playing" || !clip) return;
    if (isCorrectGuess(value, clip.answer)) {
      const pts = scoreForAttempt(attempts.length);
      setAttempts((a) => [...a, { kind: "correct", text: value }]);
      winFeedback();
      endRound("won", pts);
      notify("success", `¡Correcto! +${pts} puntos`);
      return;
    }
    const next: Attempt[] = [...attempts, { kind: "wrong", text: value }];
    setAttempts(next);
    const remaining = MAX_ATTEMPTS - next.length;
    if (remaining <= 0) {
      loseFeedback();
      endRound("lost", 0);
      notify("error", "Sin intentos. Fin de la ronda");
    } else {
      wrongFeedback();
      notify(
        "error",
        `Incorrecto. Te ${remaining === 1 ? "queda" : "quedan"} ${remaining} ${
          remaining === 1 ? "intento" : "intentos"
        }`,
      );
    }
  }

  function handleSkip() {
    if (status !== "playing") return;
    const next: Attempt[] = [...attempts, { kind: "skip" }];
    setAttempts(next);
    if (next.length >= MAX_ATTEMPTS) {
      loseFeedback();
      endRound("lost", 0);
      notify("error", "Sin intentos. Fin de la ronda");
    } else {
      const nextSeconds = DURATIONS[Math.min(next.length, MAX_ATTEMPTS - 1)];
      notify("info", `Intento saltado. Audio ampliado a ${nextSeconds}s`);
    }
  }

  async function saveScore() {
    if (!playerName.trim() || saveState === "saving") return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: playerName.trim(),
          score: totalScore,
          mode,
          daily,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
      setLbKey((k) => k + 1);
      notify("success", "Puntuación guardada en el ranking");
    } catch (e) {
      console.error(e);
      setSaveState("error");
      notify("error", "No se pudo guardar la puntuación");
    }
  }

  /* ------------------------------- render ------------------------------- */
  const poolEmpty =
    status !== "loading" && status !== "error" && pool().length === 0;

  function statusLine() {
    if (status !== "playing" && !finished) return null;
    if (!playerReady) {
      return (
        <div className="statusline">
          <SpinnerIcon size={16} />
          <span>Preparando audio del clip…</span>
        </div>
      );
    }
    if (playing) {
      return (
        <div className="statusline live">
          <PlayIcon size={14} />
          <span>
            {finished
              ? "Reproduciendo el clip completo…"
              : `Reproduciendo ${DURATIONS[currentIndex]}s…`}
          </span>
        </div>
      );
    }
    if (status === "playing") {
      return (
        <div className="statusline ok">
          <CheckIcon size={16} />
          <span>Listo. Pulsa reproducir cuando quieras.</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="page">
      {/* Barra de navegación */}
      <header className="topbar">
        <div className="shell topbar-inner">
          <div className="logo">
            <span className="mark">
              <GamepadIcon size={18} />
            </span>
            Melenitas<span className="dot">dle</span>
          </div>
          <nav className="nav">
            <a href="#partida">Jugar</a>
            <a href="#ranking">Ranking</a>
            <button
              type="button"
              className="icon-btn"
              onClick={toggleSound}
              aria-label={soundOn ? "Silenciar sonidos" : "Activar sonidos"}
              title={soundOn ? "Silenciar sonidos" : "Activar sonidos"}
            >
              {soundOn ? (
                <VolumeIcon size={18} />
              ) : (
                <VolumeMuteIcon size={18} />
              )}
            </button>
            <a className="cta" href="#partida">
              Empezar
            </a>
          </nav>
        </div>
      </header>

      <main className="shell">
        {/* Hero */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="kicker">
                <GamepadIcon size={13} /> Juego musical
              </span>
              <h1 className="hero-title">
                Melenitas<span className="dot">dle</span>
              </h1>
              <p className="hero-sub">
                Escucha un fragmento del audio de un clip del creador y adivina
                cuál es. Cada intento fallado te desvela más segundos, hasta{" "}
                {MAX_SECONDS}.
              </p>
              <div className="hero-meta">
                <span className="chip">
                  <PlayIcon size={14} /> Audio progresivo
                </span>
                <span className="chip">
                  <DotIcon size={14} /> {MAX_ATTEMPTS} intentos
                </span>
                <span className="chip">
                  <TrophyIcon size={14} /> Ranking online
                </span>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="art-card">
                <div className="art-disc">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="hole" src="/melenitas.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel de partida (ventana) */}
        <section id="partida" className="game-wrap fade">
          <div className={`window ${feedback ? `fb-${feedback}` : ""}`}>
            <div className="window-bar">
              <span className="dots">
                <i />
                <i />
                <i />
              </span>
              <span className="window-title">Partida</span>
              <span className="spacer" />
            </div>
            <div className="window-body">
              {/* Selección de modo */}
              <div className="modes">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    className={`mode-tab ${mode === m.id ? "active" : ""}`}
                    disabled={status === "playing"}
                    onClick={() => setMode(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={daily}
                    disabled={status === "playing"}
                    onChange={(e) => setDaily(e.target.checked)}
                  />
                  Modo diario
                </label>
              </div>

              {/* Volúmenes: clips y efectos */}
              <div className="volumes">
                <label className="vol">
                  <PlayIcon size={15} />
                  <span className="vol-name">Clips</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={clipVolume}
                    onChange={(e) => changeClipVolume(Number(e.target.value))}
                    aria-label="Volumen de los clips"
                  />
                  <span className="vol-val">{Math.round(clipVolume * 100)}</span>
                </label>
                <label className="vol">
                  <VolumeIcon size={15} />
                  <span className="vol-name">Efectos</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={sfxVolume}
                    onChange={(e) => changeSfxVolume(Number(e.target.value))}
                    aria-label="Volumen de los efectos de sonido"
                  />
                  <span className="vol-val">{Math.round(sfxVolume * 100)}</span>
                </label>
              </div>

              <div className="scorebar">
                <div className="stat">
                  <b>{totalScore}</b>
                  <small>Puntos</small>
                </div>
                <div className="stat">
                  <b>{rounds}</b>
                  <small>Rondas</small>
                </div>
                <div className="stat">
                  <b>
                    {daily ? "Diario" : MODES.find((m) => m.id === mode)?.label}
                  </b>
                  <small>Modo</small>
                </div>
              </div>

              {/* Escenario: tapa opaca mientras se juega; se revela al terminar */}
              <div className={`stage ${finished ? "revealed" : ""}`}>
                <div className="player-host" ref={hostRef} />
                {!finished && (
                  <div className="cover">
                    <div className={`disc ${playing ? "spin" : ""}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="label" src="/melenitas.png" alt="Melenitas" />
                    </div>
                  </div>
                )}
              </div>

        {status === "loading" && (
          <div className="statusline">
            <SpinnerIcon size={16} />
            <span>Cargando clips…</span>
          </div>
        )}

        {status === "error" && (
          <>
            <div className="alert">
              <AlertIcon size={18} />
              <span>No se pudieron cargar los clips. Revisa el servidor.</span>
            </div>
            <button className="btn btn-block" onClick={loadCatalog}>
              <SpinnerIcon size={16} /> Reintentar
            </button>
          </>
        )}

        {poolEmpty && (
          <div className="alert">
            <AlertIcon size={18} />
            <span>
              No hay clips para el modo <b>{mode}</b>. Añade alguno en
              <code> src/lib/clips.ts</code>.
            </span>
          </div>
        )}

        {/* Estado inicial: nombre obligatorio para el ranking */}
        {status === "ready" && !poolEmpty && (
          <div className="start-panel">
            <label className="field-label" htmlFor="playername">
              Tu nombre para el ranking
            </label>
            <div className="guess">
              <input
                id="playername"
                type="text"
                maxLength={24}
                placeholder="Escribe tu nombre…"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && playerName.trim()) startRound();
                }}
              />
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={startRound}
              disabled={!playerName.trim()}
            >
              <PlayIcon size={18} /> Empezar a jugar
            </button>
            {!playerName.trim() && (
              <p className="field-hint">
                <AlertIcon size={13} /> Necesitas un nombre para guardar tu
                puntuación.
              </p>
            )}
          </div>
        )}

        {/* Juego en curso / terminado */}
        {(status === "playing" || finished) && (
          <>
            {statusLine()}

            <div className="progress">
              <span
                style={{ width: `${(unlockedSeconds / MAX_SECONDS) * 100}%` }}
              />
            </div>
            <div className="segments">
              {DURATIONS.map((d, i) => (
                <span
                  key={d}
                  className={i === currentIndex && !finished ? "cur" : ""}
                >
                  {d}s
                </span>
              ))}
            </div>

            {/* Lista de intentos */}
            <div className="attempts">
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                const a = attempts[i];
                if (!a) {
                  return (
                    <div className="attempt empty" key={i}>
                      <span className="icon">
                        <DotIcon size={14} />
                      </span>
                      <span>Intento {i + 1}</span>
                    </div>
                  );
                }
                const cls =
                  a.kind === "correct"
                    ? "correct"
                    : a.kind === "skip"
                      ? "skip"
                      : "wrong";
                return (
                  <div className={`attempt ${cls}`} key={i}>
                    <span className="icon">
                      {a.kind === "correct" ? (
                        <CheckIcon size={16} />
                      ) : a.kind === "skip" ? (
                        <SkipIcon size={15} />
                      ) : (
                        <CloseIcon size={15} />
                      )}
                    </span>
                    <span>{a.kind === "skip" ? "Saltado" : a.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Controles de juego */}
            {status === "playing" && (
              <>
                <button
                  className="btn btn-block"
                  onClick={playClip}
                  disabled={!playerReady || playing}
                >
                  {!playerReady ? (
                    <>
                      <SpinnerIcon size={16} /> Preparando…
                    </>
                  ) : (
                    <>
                      <PlayIcon size={16} /> Reproducir{" "}
                      {DURATIONS[currentIndex]}s
                    </>
                  )}
                </button>
                <div style={{ height: 12 }} />
                <GuessInput options={modeAnswers} onGuess={handleGuess} />
                <div className="controls">
                  <button className="btn btn-ghost grow" onClick={handleSkip}>
                    <SkipIcon size={15} /> Saltar (+
                    {DURATIONS[Math.min(currentIndex + 1, MAX_ATTEMPTS - 1)]}s)
                  </button>
                </div>
              </>
            )}

            {/* Resultado */}
            {finished && (
              <div
                className={`result fade ${status === "won" ? "win" : "lose"}`}
              >
                <h2>
                  {status === "won" ? (
                    <span className="btn-icon-text">
                      <CheckIcon size={22} /> ¡Acertaste!
                    </span>
                  ) : (
                    <span className="btn-icon-text">
                      <CloseIcon size={22} /> Fallaste
                    </span>
                  )}
                </h2>
                <p className="muted">
                  La respuesta era:{" "}
                  <span className="answer">{clip?.answer}</span>
                </p>
                {status === "won" && (
                  <div className="points">+{lastPoints}</div>
                )}

                <button
                  className="btn btn-block"
                  onClick={playFull}
                  disabled={!playerReady}
                >
                  <PlayIcon size={16} /> Ver clip completo
                </button>
                <div style={{ height: 10 }} />
                <button
                  className="btn btn-primary btn-block"
                  onClick={startRound}
                >
                  Siguiente clip <ArrowRightIcon size={16} />
                </button>

                {/* Guardar puntuación */}
                <div style={{ height: 18 }} />
                {saveState === "saved" ? (
                  <div className="statusline ok">
                    <CheckIcon size={16} />
                    <span>Puntuación guardada como {playerName}</span>
                  </div>
                ) : (
                  <button
                    className="btn btn-block"
                    onClick={saveScore}
                    disabled={!playerName.trim() || saveState === "saving"}
                  >
                    {saveState === "saving" ? (
                      <>
                        <SpinnerIcon size={16} /> Guardando…
                      </>
                    ) : (
                      <>
                        <SaveIcon size={16} /> Guardar {totalScore} pts como{" "}
                        {playerName}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </>
        )}

              <p className="hint">
                El vídeo está oculto a propósito: solo se escucha el audio. Usa
                los botones para revelar más segundos. Tienes {MAX_ATTEMPTS}{" "}
                intentos.
              </p>
            </div>
          </div>
        </section>

        {/* Ranking */}
        <section id="ranking" className="ranking-section">
          <Leaderboard refreshKey={lbKey} />
        </section>
      </main>

      <Toasts toasts={toasts} />
      <Confetti fire={confettiFire} />
      <DopamineMode active={dopamine} videos={dopamineVideos} />

      {/* Botón modo dopamina (esquina inferior derecha) */}
      <button
        type="button"
        className={`dopamine-btn ${dopamine ? "on" : ""}`}
        onClick={() => setDopamine((d) => !d)}
      >
        <ZapIcon size={16} />
        {dopamine ? "Desactivar modo dopamina" : "Activar modo dopamina"}
      </button>

      {/* Botón flotante RiseDev (esquina inferior izquierda) */}
      <button
        type="button"
        className="risedev-btn"
        onClick={() => {
          if (sounds.risedev) playFile(sounds.risedev, true);
        }}
        aria-label="RiseDev"
        title="RiseDev"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/risedev.jpg" alt="RiseDev" />
      </button>
    </div>
  );
}
