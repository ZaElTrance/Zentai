import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hentai Library - Bibliothèque Multimédia",
  description: "Bibliothèque multimédia moderne avec 1233 vidéos hentai. Interface avec filtres avancés et tags.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased bg-neutral-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
