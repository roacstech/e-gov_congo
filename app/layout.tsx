import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Service Public RDC — Portail Officiel des Démarches Administratives",
  description:
    "Guichet unique officiel de la République Démocratique du Congo pour les démarches d'état civil, carte d'identité, passeport, permis et attestations en ligne.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased font-normal">
        {children}
      </body>
    </html>
  );
}
