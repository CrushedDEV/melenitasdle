// Efectos de sonido generados con la Web Audio API (sin ficheros externos).
// Sonido de acierto (arpegio ascendente) y de fallo (zumbido descendente).

let ctx: AudioContext | null = null;
let muted = false;
let volume = 0.7; // 0..1

export function setSfxMuted(m: boolean): void {
  muted = m;
}
export function isSfxMuted(): boolean {
  return muted;
}
export function setSfxVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v));
}
export function getSfxVolume(): number {
  return volume;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function beep(
  c: AudioContext,
  freq: number,
  at: number,
  dur: number,
  type: OscillatorType = "sine",
  peak = 0.16,
): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  const target = Math.max(0.0001, peak * volume);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(target, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/** Reproduce un archivo de audio por URL. `force` ignora el silencio. */
export function playFile(url: string, force = false): void {
  if (muted && !force) return;
  try {
    const a = new Audio(url);
    a.volume = volume;
    a.play().catch(() => {});
  } catch {
    /* noop */
  }
}

/** Reproduce uno al azar de la lista. Devuelve false si la lista está vacía. */
export function playRandom(urls: string[] | undefined): boolean {
  if (muted) return false;
  if (!urls || urls.length === 0) return false;
  playFile(urls[Math.floor(Math.random() * urls.length)]);
  return true;
}

/** Acierto: arpegio mayor ascendente (Do–Mi–Sol–Do). */
export function playSuccess(): void {
  if (muted) return;
  const c = audio();
  if (!c) return;
  c.resume();
  const t = c.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    beep(c, f, t + i * 0.085, 0.18, "triangle", 0.15);
  });
}

/** Fallo: dos tonos graves descendentes con timbre áspero. */
export function playError(): void {
  if (muted) return;
  const c = audio();
  if (!c) return;
  c.resume();
  const t = c.currentTime;
  beep(c, 196, t, 0.16, "sawtooth", 0.12);
  beep(c, 138, t + 0.12, 0.26, "sawtooth", 0.12);
}
