// ============================================================
// authUtils.ts — Utilitaires de Sécurité & Authentification
// Fournit le hachage bcrypt des mots de passe et la gestion
// des tokens JWT pour les opérations d'authentification.
// ============================================================

import { hash, compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'

// ── HACHAGE DES MOTS DE PASSE ──

/**
 * Hache un mot de passe en clair avec bcrypt (coût = 12)
 * À utiliser lors de la création ou modification d'un mot de passe.
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12) // Le facteur 12 offre un bon équilibre sécurité/performance
}

/**
 * Compare un mot de passe en clair avec son hash stocké en base.
 * Retourne true si les deux correspondent.
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

// ── GESTION DES TOKENS JWT ──

/**
 * Génère un token JWT signé contenant l'id, l'email et le rôle de l'utilisateur.
 * Durée de validité : 7 jours.
 * Utilisé pour les opérations hors session NextAuth (ex: liens de réinitialisation).
 */
export function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '7d' }
  )
}

/**
 * Vérifie et décode un token JWT.
 * Retourne le payload décodé si valide, null si expiré ou invalide.
 */
export function verifyToken(token: string): jwt.JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as jwt.JwtPayload
  } catch {
    return null // Token expiré, falsifié ou malformé
  }
}
