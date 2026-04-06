// ============================================================
// providers.tsx — Composition des Providers Globaux
// Enveloppe toute l'application avec les contextes nécessaires :
// thème clair/sombre, session NextAuth, UI/i18n, et notifications toast.
// ============================================================

'use client' // Les providers nécessitent le contexte React côté client

import { SessionProvider } from 'next-auth/react' // Fournit useSession() à toute l'app
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'          // Système de notifications toast global
import { ThemeProvider } from 'next-themes'         // Gestion du thème clair/sombre
import { UIProvider } from '@/context/UIContext'    // Contexte UI : langue, session académique, traductions

export default function Providers({ children }: { children: ReactNode }) {
  return (
    // ── ThemeProvider : active le support du mode sombre via la classe CSS ──
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* ── SessionProvider : rend la session NextAuth disponible globalement ── */}
      <SessionProvider>
        {/* ── UIProvider : gestion de la langue, des traductions et de la session académique ── */}
        <UIProvider>
          {children}
          {/* ── Toaster : affiche les notifications toast en haut à droite ── */}
          <Toaster position="top-right" />
        </UIProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
