"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Clip, GameMode } from "@/lib/types";
import {
  DURATIONS,
  MAX_ATTEMPTS,
  clipsForMode,
  isCorrectGuess,
  randomItem,
  randomStart,
  scoreForAttempt,
  shuffle,
} from "@/lib/game";
import { createPlayer, type ClipPlayer } from "@/lib/players";
import { TwitchChat, type ChatStatus } from "@/lib/twitchChat";
import GuessInput from "./GuessInput";
import Leaderboard from "./Leaderboard";
import Toasts, { useToasts } from "./Toasts";
import Confetti from "./Confetti";
import DopamineMode from "./DopamineMode";
import Modal from "./Modal";
import WelcomeModal from "./WelcomeModal";
import StreamerPoll, { type PollOption } from "./StreamerPoll";
import {
  playError,
  playFile,
  playRandom,
  playSuccess,
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
  SkipIcon,
  SpinnerIcon,
  TrophyIcon,
  VolumeIcon,
  ZapIcon,
  TwitchIcon,
  LiveIcon,
  EyeIcon,
  UsersIcon,
  InfoIcon,
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
  { id: "plagiosdev", label: "Plagios Dev" },
];

const MAX_SECONDS = DURATIONS[DURATIONS.length - 1];

export default function Game() {
  const [allClips, setAllClips] = useState<Clip[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [mode, setMode] = useState<GameMode>("mixed");

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
  const [sounds, setSounds] = useState<{
    aciertos: string[];
    fallos: string[];
    risedev: string | null;
  }>({ aciertos: [], fallos: [], risedev: null });

  const [dopamine, setDopamine] = useState(false);
  const [showPlagiosNotice, setShowPlagiosNotice] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // --- Modo streamer (chat de Twitch juega) ---
  const [twitchStatus, setTwitchStatus] = useState<ChatStatus>("idle");
  const [twitchChannel, setTwitchChannel] = useState("");
  const [showTwitchModal, setShowTwitchModal] = useState(false);
  const [channelInput, setChannelInput] = useState("");
  const [streamerMode, setStreamerMode] = useState(false);
  const [pollSize, setPollSize] = useState(4);
  const [poll, setPoll] = useState<PollOption[]>([]);
  const [voteCounts, setVoteCounts] = useState<number[]>([]);
  const [pollActive, setPollActive] = useState(false);
  const [pollRevealed, setPollRevealed] = useState(false);
  const [streamerStarted, setStreamerStarted] = useState(false);
  const [streamerSegment, setStreamerSegment] = useState(0);
  const [chatWins, setChatWins] = useState(0);
  const [chatRounds, setChatRounds] = useState(0);
  const [chatCorrect, setChatCorrect] = useState<boolean | null>(null);

  const twitchRef = useRef<TwitchChat | null>(null);
  const votesRef = useRef<Map<string, number>>(new Map());
  const streamerModeRef = useRef(false);
  const pollActiveRef = useRef(false);
  const pollLenRef = useRef(0);
  streamerModeRef.current = streamerMode;
  pollActiveRef.current = pollActive;
  pollLenRef.current = poll.length;
  const [clipVolume, setClipVolume] = useState(0.8);
  const [sfxVolume, setSfxVolumeState] = useState(0.7);

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ClipPlayer | null>(null);
  const segmentStartRef = useRef(0);
  const clipVolumeRef = useRef(0.8);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toasts, notify } = useToasts();

  // Bienvenida: se muestra la primera vez que se entra al juego (tras el
  // Wordle de acceso). Se recuerda para no volver a mostrarla sola.
  useEffect(() => {
    const seen = window.localStorage.getItem("melenitasdle:welcome-seen");
    if (!seen) setShowWelcome(true);
    // Recupera el canal de Twitch guardado para prerellenar el campo.
    const savedChannel = window.localStorage.getItem("melenitasdle:twitch-channel");
    if (savedChannel) setChannelInput(savedChannel);
  }, []);

  function closeWelcome() {
    setShowWelcome(false);
    window.localStorage.setItem("melenitasdle:welcome-seen", "1");
  }

  /* --------------------------- sonido (sfx) ----------------------------- */
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
  }, []);

  // Volúmenes guardados (clips y efectos). Solo si hay valor guardado.
  useEffect(() => {
    const rawCv = window.localStorage.getItem("melenitasdle:vol:clips");
    const rawSv = window.localStorage.getItem("melenitasdle:vol:sfx");
    if (rawCv !== null) {
      const cv = Number(rawCv);
      if (Number.isFinite(cv) && cv >= 0 && cv <= 1) {
        setClipVolume(cv);
        clipVolumeRef.current = cv;
      }
    }
    if (rawSv !== null) {
      const sv = Number(rawSv);
      if (Number.isFinite(sv) && sv >= 0 && sv <= 1) {
        setSfxVolumeState(sv);
        setSfxVolume(sv);
      }
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

  /* ----------------------- Twitch / modo streamer ----------------------- */
  // Procesa cada mensaje del chat: cuenta un voto por persona (última letra vale).
  const handleChatMessage = useCallback((user: string, message: string) => {
    if (!streamerModeRef.current || !pollActiveRef.current) return;
    const m = message.trim().toUpperCase().match(/^!?\s*([A-Z])\s*[.!]*$/);
    if (!m) return;
    const idx = m[1].charCodeAt(0) - 65;
    if (idx < 0 || idx >= pollLenRef.current) return;
    votesRef.current.set(user, idx); // un voto por persona (la última letra cuenta)
  }, []);

  function connectTwitch(channel: string) {
    const ch = channel.trim().toLowerCase().replace(/^#/, "");
    if (!ch) return;
    twitchRef.current?.disconnect();
    const chat = new TwitchChat(ch, handleChatMessage, (s) => {
      setTwitchStatus(s);
      if (s === "connected") notify("success", `Conectado al chat de ${ch}`);
    });
    twitchRef.current = chat;
    setTwitchChannel(ch);
    // Recuerda el canal para la próxima vez.
    window.localStorage.setItem("melenitasdle:twitch-channel", ch);
    chat.connect();
    setShowTwitchModal(false);
  }

  function disconnectTwitch() {
    twitchRef.current?.disconnect();
    twitchRef.current = null;
    setTwitchStatus("idle");
    playerRef.current?.stop();
    setPlaying(false);
    setStreamerMode(false);
    setStreamerStarted(false);
    setPollActive(false);
    setPollRevealed(false);
  }

  useEffect(() => {
    return () => twitchRef.current?.disconnect();
  }, []);

  // Recuento de votos en vivo mientras la encuesta está abierta.
  useEffect(() => {
    if (!pollActive) return;
    const id = setInterval(() => {
      const counts = new Array(pollLenRef.current).fill(0);
      for (const v of votesRef.current.values()) counts[v] = (counts[v] ?? 0) + 1;
      setVoteCounts(counts);
    }, 250);
    return () => clearInterval(id);
  }, [pollActive]);

  function buildPoll(answer: string): PollOption[] {
    const distractors = shuffle(
      modeAnswers.filter((a) => a !== answer),
    ).slice(0, Math.max(2, pollSize - 1));
    const texts = shuffle([answer, ...distractors]);
    return texts.map((text, i) => ({
      letter: String.fromCharCode(65 + i),
      text,
      correct: text === answer,
    }));
  }

  function startStreamerRound() {
    const candidates = pool();
    if (candidates.length === 0) return;
    const next = randomItem(candidates);
    votesRef.current = new Map();
    const opts = buildPoll(next.answer);
    setPoll(opts);
    setVoteCounts(new Array(opts.length).fill(0));
    setPollRevealed(false);
    setChatCorrect(null);
    setStreamerSegment(0);
    setStreamerStarted(true);
    playerRef.current?.stop();
    setClip(next);
    setRoundId((r) => r + 1);
    setPollActive(true);
    setPlaying(false);
  }

  function streamerPlay() {
    const p = playerRef.current;
    if (!p || !playerReady) return;
    const seconds = DURATIONS[streamerSegment];
    setPlaying(true);
    p.play(seconds, segmentStartRef.current).catch(() => {});
    window.setTimeout(() => setPlaying(false), seconds * 1000);
  }

  function streamerSkip() {
    setStreamerSegment((s) => Math.min(s + 1, MAX_ATTEMPTS - 1));
  }

  function streamerReveal() {
    // Recuento final desde el mapa de votos.
    const counts = new Array(poll.length).fill(0);
    for (const v of votesRef.current.values()) counts[v] = (counts[v] ?? 0) + 1;
    setVoteCounts(counts);
    const max = Math.max(...counts, 0);
    const winner = max > 0 ? counts.indexOf(max) : -1;
    const correct = winner >= 0 && poll[winner]?.correct;
    setPollActive(false);
    setPollRevealed(true);
    setChatCorrect(correct);
    setChatRounds((r) => r + 1);
    if (correct) {
      setChatWins((w) => w + 1);
      winFeedback();
    } else {
      loseFeedback();
    }
    playFull();
  }

  const pollWinner = (() => {
    const max = Math.max(...voteCounts, 0);
    return max > 0 ? voteCounts.indexOf(max) : -1;
  })();

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
          // Precarga el tramo exacto para que el primer play suene al instante.
          player!.preloadSegment?.(segmentStartRef.current);
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
    const next = randomItem(candidates);
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
  // El escenario se revela al terminar (normal) o al revelar la encuesta (streamer).
  const revealed = finished || (streamerMode && pollRevealed);

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
    const newTotal = totalScore + points;
    setStatus(result);
    setLastPoints(points);
    setTotalScore(newTotal);
    setRounds((r) => r + 1);
    // Guarda la puntuación automáticamente (sin pulsar botón).
    autoSave(newTotal);
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

  // Autoguardado: se llama solo al terminar cada ronda con el total actualizado.
  async function autoSave(total: number) {
    if (!playerName.trim()) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: playerName.trim(), score: total, mode }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
      setLbKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      setSaveState("error");
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
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowWelcome(true)}
              aria-label="Instrucciones"
              title="Instrucciones"
            >
              <InfoIcon size={18} />
            </button>
            {twitchStatus === "connected" ? (
              <button
                type="button"
                className="twitch-chip"
                onClick={disconnectTwitch}
                title="Desconectar"
              >
                <TwitchIcon size={15} /> {twitchChannel}
                <span className="dot-live" />
              </button>
            ) : (
              <button
                type="button"
                className="twitch-cta"
                onClick={() => setShowTwitchModal(true)}
              >
                <TwitchIcon size={16} /> Conectar Twitch
              </button>
            )}
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

        <div className="game-layout">
        {/* Ranking (columna izquierda, a la altura de la partida) */}
        <aside id="ranking" className="ranking-side">
          <Leaderboard refreshKey={lbKey} />
        </aside>

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
                    className={`mode-tab mode-${m.id} ${
                      mode === m.id ? "active" : ""
                    }`}
                    disabled={status === "playing"}
                    onClick={() => {
                      // Cambiar de categoría NO sale del modo streamer; solo
                      // reinicia la ronda para usar el nuevo catálogo.
                      playerRef.current?.stop();
                      setPlaying(false);
                      setStreamerStarted(false);
                      setPollActive(false);
                      setPollRevealed(false);
                      setMode(m.id);
                      if (m.id === "plagiosdev") setShowPlagiosNotice(true);
                    }}
                  >
                    {m.label}
                  </button>
                ))}
                {twitchStatus === "connected" && (
                  <button
                    className={`mode-tab mode-streamer ${
                      streamerMode ? "active" : ""
                    }`}
                    onClick={() => {
                      playerRef.current?.stop();
                      setPlaying(false);
                      setStreamerMode((v) => !v);
                      setStreamerStarted(false);
                      setPollActive(false);
                      setPollRevealed(false);
                    }}
                  >
                    <LiveIcon size={13} /> Modo streamer
                  </button>
                )}
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

              {streamerMode ? (
                <div className="scorebar">
                  <div className="stat">
                    <b>{chatWins}</b>
                    <small>Aciertos chat</small>
                  </div>
                  <div className="stat">
                    <b>{chatRounds}</b>
                    <small>Rondas</small>
                  </div>
                  <div className="stat">
                    <b>{MODES.find((m) => m.id === mode)?.label}</b>
                    <small>Modo</small>
                  </div>
                </div>
              ) : (
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
                    <b>{MODES.find((m) => m.id === mode)?.label}</b>
                    <small>Modo</small>
                  </div>
                </div>
              )}

              {/* Escenario: tapa opaca mientras se juega; se revela al terminar */}
              <div className={`stage ${revealed ? "revealed" : ""}`}>
                <div className="player-host" ref={hostRef} />
                {!revealed && (
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
        {status === "ready" && !poolEmpty && !streamerMode && (
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

        {/* ---------------------- MODO STREAMER ---------------------- */}
        {streamerMode && !poolEmpty && (
          <div className="streamer">
            <div className="streamer-live">
              <span className="live-badge">
                <LiveIcon size={13} /> EN DIRECTO
              </span>
              <span className="live-channel">
                <TwitchIcon size={14} /> {twitchChannel}
              </span>
              <span className="live-votes">
                <UsersIcon size={14} />{" "}
                {voteCounts.reduce((a, b) => a + b, 0)} votos
              </span>
            </div>

            {!streamerStarted ? (
              <>
                <p className="streamer-help">
                  El chat adivina el clip. Elige cuántas opciones tendrá la
                  encuesta y empieza la ronda. El público vota escribiendo la
                  letra (A, B, C…) en el chat.
                </p>
                <div className="pollsize">
                  <span className="field-label">Opciones:</span>
                  {[3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      className={`pill ${pollSize === n ? "active" : ""}`}
                      onClick={() => setPollSize(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-primary btn-block"
                  onClick={startStreamerRound}
                >
                  <PlayIcon size={18} /> Empezar ronda del chat
                </button>
              </>
            ) : (
              <>
                {statusLine()}
                <StreamerPoll
                  options={poll}
                  counts={voteCounts}
                  revealed={pollRevealed}
                  winner={pollWinner}
                />

                {pollRevealed ? (
                  <div
                    className={`streamer-result ${
                      chatCorrect ? "win" : "lose"
                    }`}
                  >
                    <b>{chatCorrect ? "¡El chat acertó!" : "El chat falló"}</b>
                    <span>
                      Respuesta: {poll.find((o) => o.correct)?.text}
                    </span>
                  </div>
                ) : (
                  <div className="streamer-controls">
                    <button
                      className="btn grow"
                      onClick={streamerPlay}
                      disabled={!playerReady || playing}
                    >
                      {!playerReady ? (
                        <>
                          <SpinnerIcon size={16} /> Preparando…
                        </>
                      ) : (
                        <>
                          <PlayIcon size={16} /> Reproducir{" "}
                          {DURATIONS[streamerSegment]}s
                        </>
                      )}
                    </button>
                    <button
                      className="btn"
                      onClick={streamerSkip}
                      disabled={streamerSegment >= MAX_ATTEMPTS - 1}
                    >
                      <SkipIcon size={15} /> +
                      {DURATIONS[Math.min(streamerSegment + 1, MAX_ATTEMPTS - 1)]}s
                    </button>
                  </div>
                )}

                <div style={{ height: 12 }} />
                {pollRevealed ? (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={startStreamerRound}
                  >
                    Siguiente clip <ArrowRightIcon size={16} />
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={streamerReveal}
                  >
                    <EyeIcon size={16} /> Revelar resultado
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Juego en curso / terminado */}
        {!streamerMode && (status === "playing" || finished) && (
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

                {/* Autoguardado (sin botón) */}
                <div style={{ height: 14 }} />
                {saveState === "saving" && (
                  <div className="statusline">
                    <SpinnerIcon size={16} /> Guardando puntuación…
                  </div>
                )}
                {saveState === "saved" && (
                  <div className="statusline ok">
                    <CheckIcon size={16} />
                    <span>Guardado como {playerName} · {totalScore} pts</span>
                  </div>
                )}
                {saveState === "error" && (
                  <div className="statusline" style={{ color: "var(--red-bright)" }}>
                    <AlertIcon size={16} /> No se pudo guardar la puntuación
                  </div>
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
        </div>
      </main>

      <WelcomeModal open={showWelcome} onClose={closeWelcome} />

      <Modal
        open={showTwitchModal}
        onClose={() => setShowTwitchModal(false)}
        title="Conectar con Twitch"
        icon={<TwitchIcon size={22} />}
        actionLabel="Cerrar"
      >
        <p>
          Escribe tu <strong>canal de Twitch</strong> para que el chat pueda
          jugar en el modo streamer. Solo se lee el chat (no hace falta iniciar
          sesión).
        </p>
        <div className="guess" style={{ marginTop: 14 }}>
          <input
            type="text"
            placeholder="tu_canal"
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") connectTwitch(channelInput);
            }}
          />
        </div>
        {twitchStatus === "connecting" && (
          <div className="statusline" style={{ marginTop: 10 }}>
            <SpinnerIcon size={16} /> Conectando…
          </div>
        )}
        <div style={{ height: 12 }} />
        <button
          className="btn btn-primary btn-block"
          onClick={() => connectTwitch(channelInput)}
          disabled={!channelInput.trim()}
        >
          <TwitchIcon size={16} /> Conectar
        </button>
      </Modal>

      <Modal
        open={showPlagiosNotice}
        onClose={() => setShowPlagiosNotice(false)}
        title="Aviso — Modo Plagios Dev"
        icon={<AlertIcon size={22} />}
      >
        <p>
          Los vídeos de este modo son del canal de <strong>RiseDev</strong>,{" "}
          <strong>CentusDev</strong> y vídeos del grupo{" "}
          <strong>Plagios Dev</strong> que <strong>no están públicos</strong> y
          pertenecen al grupo.
        </p>
      </Modal>

      <Toasts toasts={toasts} />
      <Confetti fire={confettiFire} />
      <DopamineMode active={dopamine} />

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
