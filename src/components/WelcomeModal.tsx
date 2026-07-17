"use client";

import {
  ArrowRightIcon,
  DotIcon,
  GamepadIcon,
  LiveIcon,
  PlayIcon,
  TrophyIcon,
  TwitchIcon,
  ZapIcon,
} from "./Icon";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ITEMS = [
  {
    icon: <PlayIcon size={18} />,
    title: "Cómo se juega",
    text: "Escucha un fragmento de audio de un clip y adivina de qué vídeo es. Cada fallo desvela más segundos (hasta 16s) y tienes 6 intentos. Cuantos menos uses, más puntos.",
  },
  {
    icon: <GamepadIcon size={18} />,
    title: "Modos: Twitch / YouTube / Mixto",
    text: "Elige de dónde salen los clips: solo Twitch, solo YouTube, o los dos mezclados.",
  },
  {
    icon: <ZapIcon size={18} />,
    title: "Plagios Dev",
    text: "Colección aparte con vídeos de RiseDev, CentusDev y del grupo Plagios Dev.",
  },
  {
    icon: <TwitchIcon size={18} />,
    title: "Conectar Twitch",
    text: "Desde la barra superior puedes conectar tu canal para leer el chat en directo.",
  },
  {
    icon: <LiveIcon size={18} />,
    title: "Modo streamer",
    text: "Con Twitch conectado, el chat adivina por votación (escribiendo A, B, C…) mientras tú controlas la reproducción y revelas el resultado.",
  },
  {
    icon: <TrophyIcon size={18} />,
    title: "Ranking",
    text: "Guarda tu puntuación con tu nombre y compite en la tabla de posiciones.",
  },
];

export default function WelcomeModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card welcome-card fade"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="welcome-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/melenitas.png" alt="" className="welcome-logo" />
          <span className="kicker">Bienvenido</span>
          <h2>Melenitasdle</h2>
          <p>Todo lo que necesitas saber antes de tu primera ronda.</p>
        </div>

        <div className="welcome-list">
          {ITEMS.map((it) => (
            <div className="welcome-item" key={it.title}>
              <span className="welcome-icon">{it.icon}</span>
              <div>
                <b>{it.title}</b>
                <p>{it.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-block" onClick={onClose}>
          Empezar a jugar <ArrowRightIcon size={16} />
        </button>
        <p className="welcome-hint">
          <DotIcon size={10} /> Puedes volver a abrir esto desde
          "Instrucciones" en la barra superior.
        </p>
      </div>
    </div>
  );
}
