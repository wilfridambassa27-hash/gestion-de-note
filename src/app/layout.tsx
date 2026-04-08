// ============================================================
// layout.tsx — Layout Racine de l'Application (Root Layout)
// Définit la structure HTML de base pour toutes les pages :
// langue, polices Google, métadonnées SEO, et providers globaux.
// ============================================================

import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Plus_Jakarta_Sans } from 'next/font/google';

// ── Chargement de la police Google : Plus Jakarta Sans ──
// Police premium utilisée sur tout le site pour une typographie moderne

// ── Métadonnées SEO globales ──
// Héritées par toutes les pages sauf si elles définissent leurs propres métadonnées
export const metadata: Metadata = {
  title: "EduNotes – Gestion des Notes Scolaires",
  description: "Plateforme intelligente de gestion des notes, bulletins QR et analytics pédagogiques",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

// ── Layout racine : englobe toute l'application ──
// Injecte les Providers (Session, Thème, UI) autour de tous les enfants
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="fr" pour l'accessibilité et le SEO francophone
    <html lang="fr" suppressHydrationWarning>
      {/* Police Jakarta San appliquée globalement via CSS variable */}
      <body style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif" }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
