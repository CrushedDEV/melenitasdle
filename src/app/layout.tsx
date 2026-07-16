import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
