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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased font-normal">
        {children}
      </body>
    </html>
  );
}
