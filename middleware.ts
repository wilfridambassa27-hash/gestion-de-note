// ============================================================
// middleware.ts — Garde de sécurité centralisée (Next.js Edge)
// Intercepte TOUTES les requêtes et applique un contrôle d'accès
// basé sur le rôle JWT avant d'autoriser la navigation.
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ── Table de correspondance : rôle → préfixes de routes protégées ──
// Chaque rôle n'a accès qu'à ses propres routes de tableau de bord
const protectedRoutes = {
  admin: ['/admin'],
  etudiant: ['/etudiant'],
  enseignant: ['/enseignant'],
  parent: ['/parent']
}

export async function middleware(request: NextRequest) {
  // Décode le token JWT depuis le cookie de session NextAuth
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  const { pathname } = request.nextUrl

  // ── Routes publiques : accessibles sans authentification ──
  // Login, accueil et endpoints auth sont toujours autorisés
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // ── Routes protégées : vérification du rôle pour chaque dashboard ──
  for (const [role, paths] of Object.entries(protectedRoutes)) {
    if (paths.some(path => pathname.startsWith(path))) {
      // Si aucun token n'est présent → redirection vers la page de connexion
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      const userRole = token.role?.toLowerCase()
      // Si le rôle ne correspond pas à la route → erreur d'accès
      if (userRole !== role && !(userRole === 'admin' && role === 'admin')) {
        return NextResponse.redirect(new URL('/login?error=role', request.url))
      }
      
      // ── Injection des données de session dans les headers HTTP ──
      // Permet aux composants serveur d'accéder au contexte sans re-fetcher
      const response = NextResponse.next()
      response.headers.set('x-session-role', userRole || '')
      response.headers.set('x-session-id', token.id || '')
      response.headers.set('x-academic-session', token.academicSession || '')
      
      return response
    }
  }

  // Route non protégée non listée → accès autorisé par défaut
  return NextResponse.next()
}

// ── Configuration du matcher — exclut les assets statiques ──
// Le middleware ne s'exécute pas sur les fichiers Next.js internes
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
