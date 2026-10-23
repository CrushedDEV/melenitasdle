import type { Metadata } from "next";
import { Anton, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./redesign.css";

// Display condensada para titulares, serif itálica de acento y grotesca para UI.
const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-serif",
  display: "swap",
});
const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Melenitasdle — adivina el clip",
  description:
    "Juego tipo Heardle: adivina clips del creador a partir de fragmentos de audio de Twitch y YouTube Shorts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${serif.variable} ${body.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
