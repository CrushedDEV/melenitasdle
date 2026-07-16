# Melenitasdle

Juego tipo **Heardle** para adivinar clips de un creador de contenido a partir
de fragmentos de audio de **Twitch** y **YouTube Shorts**. El audio se revela de
forma progresiva (0.5s -> 1s -> 2s -> 4s -> 8s -> 16s) y tienes 6 intentos para
acertar el origen del clip.

- Estética gaming oscura: carbón cálido de base, coral/salmón como color principal, grises oscuros y texto blanco.
- Tres modos: **Twitch**, **YouTube** o **Mixto**.
- **Modo diario** opcional (el mismo clip para todos cada día).
- Autocompletado con la lista de respuestas posibles.
- Feedback visual en cada acción: estados de carga, acierto, fallo, saltos, guardado.
- Iconos SVG profesionales (sin emojis).
- Sistema de puntuación + tabla de líderes (backend ligero en Node).

## Stack

- **Next.js 14** (App Router, TypeScript) en el frontend.
- **Backend ligero** con API Routes de Node (`/api/clips`, `/api/scores`).
  Las puntuaciones se guardan en `data/scores.json` (sin base de datos).

## Puesta en marcha

```bash
npm install
npm run dev
# abre http://localhost:3000
```

Build de producción:

```bash
npm run build
npm start
```

## Añadir tus propios clips

Edita `src/lib/clips.ts` y pega la **URL** + la **respuesta**. La plataforma se
detecta sola:

```ts
const RAW_CLIPS = [
  { url: "https://www.youtube.com/shorts/AbCdEf12345", answer: "Nombre del momento" },
  { url: "https://youtu.be/AbCdEf12345?t=12",          answer: "Otro momento" },
  { url: "https://www.twitch.tv/videos/123456789?t=10m42s", answer: "Clutch en el torneo" },
];
```

Formatos de URL admitidos:

- **YouTube:** `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID`.
- **Twitch:** `twitch.tv/videos/VOD_ID` (VOD).

El **segundo de inicio** del fragmento se toma del parámetro `t` de la URL
(`?t=90`, `?t=1m30s`, `?t=1h2m3s`) o puedes fijarlo con `start` en segundos:
`{ url, answer, start: 642 }`.

> **Nota sobre Twitch:** el reproductor JS de Twitch controla play/pause/seek
> sobre **VODs** (`twitch.tv/videos/<id>`), que es lo que permite el revelado
> progresivo. Un *clip* suelto (`clips.twitch.tv/SLUG`) no expone ese control:
> usa la URL del VOD e indica el segundo del momento con `t=` o `start`. Los
> Shorts de YouTube son vídeos normales y funcionan directamente.

Las URLs no válidas se descartan con un aviso en consola (no rompen el juego).
`POSSIBLE_ANSWERS` (autocompletado) se genera solo a partir de las respuestas.

## Despliegue en Vercel

1. Sube el repo e impórtalo en Vercel (framework detectado: Next.js).
2. **Ranking en producción:** el sistema de archivos de Vercel es de solo
   lectura, así que las puntuaciones necesitan un store Redis. En el dashboard:
   **Storage → KV** (o conecta **Upstash Redis**). Al vincularlo, Vercel añade
   las variables `KV_REST_API_URL` / `KV_REST_API_TOKEN` automáticamente y el
   backend las usa sin más cambios (ver `.env.example`).
3. En local (`npm run dev`) no necesitas nada: el ranking se guarda en
   `data/scores.json`.

## Puntuación

Aciertas antes = más puntos: 1er intento = 600, y baja 100 por intento hasta
100 en el último. Fallar la ronda = 0. El total de la sesión se puede guardar
en la tabla de líderes con tu nombre.

## API

| Método | Ruta           | Descripción                                  |
| ------ | -------------- | -------------------------------------------- |
| GET    | `/api/clips`   | Catálogo de clips + respuestas posibles.     |
| GET    | `/api/scores`  | Top puntuaciones (`?limit=10`).              |
| POST   | `/api/scores`  | Guarda `{ player, score, mode, daily }`.     |

## Estructura

```
src/
├── app/
│   ├── api/clips/route.ts     # backend: catálogo
│   ├── api/scores/route.ts    # backend: leaderboard
│   ├── globals.css            # tema gaming oscuro
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Game.tsx               # lógica y UI del juego
│   ├── GuessInput.tsx         # input con autocompletado
│   ├── Icon.tsx               # iconos SVG (sin emojis)
│   ├── Leaderboard.tsx
│   └── Toasts.tsx             # notificaciones de feedback
└── lib/
    ├── clips.ts               # ← tus clips aquí (URL + respuesta)
    ├── parse.ts               # extrae ids de las URLs de YouTube/Twitch
    ├── game.ts                # duraciones, puntuación, modo diario
    ├── players.ts             # control de YouTube + Twitch
    ├── store.ts               # ranking: Vercel KV/Upstash o fichero local
    └── types.ts
```
