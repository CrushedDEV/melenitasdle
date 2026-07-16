import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Client-ID público del reproductor web de Twitch (el mismo que usa clips.twitch.tv).
const TWITCH_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";
const GQL = "https://gql.twitch.tv/gql";

interface Quality {
  frameRate: number;
  quality: string;
  sourceURL: string;
}

// GET /api/twitch-clip?slug=SLUG  ->  { url, duration, quality }
//
// Resuelve un clip de Twitch a la URL de su MP4 para poder reproducirlo en un
// <video> nativo (control total: tramos, pausa y revelado). Se cachea 1h.
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Falta el parámetro slug" }, { status: 400 });
  }

  try {
    const query = `query{clip(slug:${JSON.stringify(
      slug,
    )}){durationSeconds videoQualities{frameRate quality sourceURL} playbackAccessToken(params:{platform:"web",playerBackend:"mediaplayer",playerType:"clips-api"}){signature value}}}`;

    const res = await fetch(GQL, {
      method: "POST",
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`GQL ${res.status}`);
    const json = (await res.json()) as {
      data?: {
        clip?: {
          durationSeconds?: number;
          playbackAccessToken?: { signature: string; value: string };
          videoQualities?: Quality[];
        };
      };
    };

    const clip = json?.data?.clip;
    const token = clip?.playbackAccessToken;
    const qualities = clip?.videoQualities ?? [];
    if (!token || qualities.length === 0) {
      return NextResponse.json(
        { error: "Clip no encontrado o no disponible" },
        { status: 404 },
      );
    }

    // Calidad más baja = carga rápida (el juego va de audio).
    const sorted = [...qualities].sort(
      (a, b) => parseInt(a.quality) - parseInt(b.quality),
    );
    const chosen = sorted[0];
    const url = `${chosen.sourceURL}?sig=${token.signature}&token=${encodeURIComponent(
      token.value,
    )}`;

    return NextResponse.json({
      url,
      duration: clip?.durationSeconds ?? 0,
      quality: chosen.quality,
    });
  } catch (e) {
    console.error("[twitch-clip]", e);
    return NextResponse.json(
      { error: "No se pudo resolver el clip de Twitch" },
      { status: 502 },
    );
  }
}
