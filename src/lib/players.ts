// Controladores de reproducción para YouTube y Twitch.
// Exponen una interfaz común para reproducir un fragmento de N segundos
// desde un offset y luego pausar automáticamente (revelado progresivo Heardle).

import type { Clip } from "./types";

export interface ClipPlayer {
  /** Se resuelve cuando el reproductor está listo para reproducir. */
  readonly ready: Promise<void>;
  /** Duración total del vídeo en segundos (0 si no se conoce). */
  getDuration(): Promise<number>;
  /** Reproduce desde `from` (o el inicio) durante `seconds` y pausa. */
  play(seconds: number, from?: number): Promise<void>;
  /** Reproduce el clip/vídeo completo, sin pausa automática (revelado final). */
  playFull(): Promise<void>;
  /** Ajusta el volumen (0..1). Puede llamarse antes o después de `ready`. */
  setVolume(v: number): void;
  /** Precarga (bufferiza) el tramo que se va a reproducir, para que suene al instante. */
  preloadSegment?(from: number): void;
  /** Detiene la reproducción inmediatamente. */
  stop(): void;
  /** Libera el reproductor y limpia el DOM. */
  destroy(): void;
}

/* ------------------------------- YouTube -------------------------------- */

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { YT?: { Player: unknown } };
  if (w.YT && w.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise<void>((resolve) => {
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

class YouTubePlayer implements ClipPlayer {
  private player: any = null;
  readonly ready: Promise<void>;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private start: number;
  private gen = 0; // invalida esperas/precargas obsoletas
  private destroyed = false;

  constructor(container: HTMLElement, videoId: string, start = 0) {
    this.start = start;
    this.ready = loadYouTubeApi().then(
      () =>
        new Promise<void>((resolve) => {
          const YT = (window as any).YT;
          this.player = new YT.Player(container, {
            videoId,
            width: "100%",
            height: "100%",
            playerVars: {
              controls: 0,
              disablekb: 1,
              modestbranding: 1,
              rel: 0,
              fs: 0,
              playsinline: 1,
            },
            events: {
              onReady: () => resolve(),
            },
          });
        }),
    );
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  // Espera a que el reproductor esté realmente REPRODUCIENDO (estado 1).
  private waitPlaying(myGen: number): Promise<void> {
    return new Promise((resolve) => {
      const started = Date.now();
      const check = () => {
        if (this.destroyed || myGen !== this.gen) return resolve();
        let state = -1;
        try {
          state = this.player.getPlayerState();
        } catch {
          /* noop */
        }
        if (state === 1 || Date.now() - started > 4000) return resolve();
        setTimeout(check, 60);
      };
      check();
    });
  }

  async getDuration(): Promise<number> {
    await this.ready;
    for (let i = 0; i < 6; i++) {
      const d = Number(this.player.getDuration?.() ?? 0);
      if (d > 0) return d;
      await new Promise((r) => setTimeout(r, 200));
    }
    return 0;
  }

  // Precarga: reproduce muteado en el tramo para bufferizar, y pausa. Así el
  // primer play real suena al instante (antes se perdía por el buffering).
  preloadSegment(from: number): void {
    this.start = from;
    this.ready.then(async () => {
      if (this.destroyed) return;
      const myGen = ++this.gen;
      try {
        this.player.mute();
        this.player.seekTo(from, true);
        this.player.playVideo();
        await this.waitPlaying(myGen);
        if (myGen !== this.gen || this.destroyed) return;
        this.player.pauseVideo();
        this.player.seekTo(from, true);
      } catch {
        /* noop */
      }
    });
  }

  async play(seconds: number, from?: number): Promise<void> {
    await this.ready;
    const myGen = ++this.gen;
    this.clearTimer();
    try {
      this.player.unMute();
    } catch {
      /* noop */
    }
    this.player.seekTo(from ?? this.start, true);
    this.player.playVideo();
    await this.waitPlaying(myGen);
    if (myGen !== this.gen || this.destroyed) return;
    this.timer = setTimeout(() => {
      try {
        this.player.pauseVideo();
      } catch {
        /* noop */
      }
    }, seconds * 1000);
  }

  async playFull(): Promise<void> {
    await this.ready;
    ++this.gen;
    this.clearTimer();
    try {
      this.player.unMute();
    } catch {
      /* noop */
    }
    this.player.seekTo(0, true);
    this.player.playVideo();
  }

  setVolume(v: number): void {
    const vol = Math.max(0, Math.min(1, v));
    this.ready.then(() => {
      try {
        this.player.setVolume(Math.round(vol * 100));
      } catch {
        /* noop */
      }
    });
  }

  stop(): void {
    ++this.gen;
    this.clearTimer();
    try {
      this.player?.pauseVideo();
    } catch {
      /* noop */
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.stop();
    try {
      this.player?.destroy();
    } catch {
      /* noop */
    }
    this.player = null;
  }
}

/* -------------------------------- Twitch -------------------------------- */

let twitchApiPromise: Promise<void> | null = null;

function loadTwitchApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { Twitch?: { Player: unknown } };
  if (w.Twitch && w.Twitch.Player) return Promise.resolve();
  if (twitchApiPromise) return twitchApiPromise;

  twitchApiPromise = new Promise<void>((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = "https://player.twitch.tv/js/embed/v1.js";
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error("No se pudo cargar el reproductor de Twitch"));
    document.head.appendChild(tag);
  });
  return twitchApiPromise;
}

class TwitchPlayer implements ClipPlayer {
  private player: any = null;
  readonly ready: Promise<void>;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private start: number;

  constructor(container: HTMLElement, videoId: string, start = 0) {
    this.start = start;
    this.ready = loadTwitchApi().then(
      () =>
        new Promise<void>((resolve) => {
          const Twitch = (window as any).Twitch;
          this.player = new Twitch.Player(container, {
            video: videoId,
            width: "100%",
            height: "100%",
            autoplay: false,
            muted: false,
            // `parent` lo gestiona el propio embed según el host.
          });
          this.player.addEventListener(Twitch.Player.READY, () => resolve());
        }),
    );
  }

  async getDuration(): Promise<number> {
    await this.ready;
    for (let i = 0; i < 6; i++) {
      const d = Number(this.player.getDuration?.() ?? 0);
      if (d > 0) return d;
      await new Promise((r) => setTimeout(r, 200));
    }
    return 0;
  }

  async play(seconds: number, from?: number): Promise<void> {
    await this.ready;
    this.stop();
    this.player.seek(from ?? this.start);
    this.player.setMuted(false);
    this.player.play();
    this.timer = setTimeout(() => {
      try {
        this.player.pause();
      } catch {
        /* noop */
      }
    }, seconds * 1000);
  }

  async playFull(): Promise<void> {
    await this.ready;
    this.stop();
    // Twitch VOD: desde el momento del clip en adelante (el VOD puede durar horas).
    this.player.seek(this.start);
    this.player.setMuted(false);
    this.player.play();
  }

  setVolume(v: number): void {
    const vol = Math.max(0, Math.min(1, v));
    this.ready.then(() => {
      try {
        this.player.setVolume(vol);
      } catch {
        /* noop */
      }
    });
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      this.player?.pause();
    } catch {
      /* noop */
    }
  }

  destroy(): void {
    this.stop();
    // El SDK de Twitch no expone destroy(); limpiamos el contenedor.
    this.player = null;
  }
}

/* --------------------- Media nativo (clips de Twitch) ------------------- */

// Reproduce una URL de vídeo (MP4) en un <video> nativo. Control total.
class NativeMediaPlayer implements ClipPlayer {
  private video: HTMLVideoElement;
  readonly ready: Promise<void>;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private start: number;

  constructor(container: HTMLElement, slug: string, start = 0) {
    this.start = start;
    const video = document.createElement("video");
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.playsInline = true;
    video.preload = "auto";
    video.controls = false;
    this.video = video;
    container.appendChild(video);

    this.ready = (async () => {
      const res = await fetch(`/api/twitch-clip?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error("No se pudo resolver el clip de Twitch");
      const data = (await res.json()) as { url: string };
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Error al cargar el vídeo del clip"));
        video.src = data.url;
      });
    })();
  }

  async getDuration(): Promise<number> {
    await this.ready;
    return Number.isFinite(this.video.duration) ? this.video.duration : 0;
  }

  async play(seconds: number, from?: number): Promise<void> {
    await this.ready;
    this.stop();
    this.video.muted = false;
    this.video.currentTime = from ?? this.start;
    await this.video.play();
    this.timer = setTimeout(() => {
      try {
        this.video.pause();
      } catch {
        /* noop */
      }
    }, seconds * 1000);
  }

  async playFull(): Promise<void> {
    await this.ready;
    this.stop();
    this.video.muted = false;
    this.video.currentTime = 0;
    await this.video.play();
  }

  setVolume(v: number): void {
    this.video.volume = Math.max(0, Math.min(1, v));
  }

  preloadSegment(from: number): void {
    this.start = from;
    this.ready.then(() => {
      try {
        // Posiciona el vídeo en el tramo para que bufferice esa zona.
        this.video.currentTime = from;
      } catch {
        /* noop */
      }
    });
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      this.video.pause();
    } catch {
      /* noop */
    }
  }

  destroy(): void {
    this.stop();
    this.video.removeAttribute("src");
    try {
      this.video.load();
    } catch {
      /* noop */
    }
    this.video.remove();
  }
}

/* ------------------------------- Factory -------------------------------- */

export function createPlayer(clip: Clip, container: HTMLElement): ClipPlayer {
  if (clip.type === "youtube") {
    if (!clip.youtubeId) throw new Error(`Clip ${clip.id} sin youtubeId`);
    return new YouTubePlayer(container, clip.youtubeId, clip.start ?? 0);
  }
  // Twitch: VOD (embed) o clip (MP4 nativo).
  if (clip.twitchVideoId) {
    return new TwitchPlayer(container, clip.twitchVideoId, clip.start ?? 0);
  }
  if (clip.twitchClipSlug) {
    return new NativeMediaPlayer(container, clip.twitchClipSlug, clip.start ?? 0);
  }
  throw new Error(`Clip ${clip.id} de Twitch sin VOD ni clip`);
}
