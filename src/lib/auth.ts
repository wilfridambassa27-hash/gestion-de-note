// ============================================================
// auth.ts — Configuration NextAuth (Authentification Centrale)
// Gère la connexion par identifiants (email + mot de passe),
// la création du token JWT enrichi, et la session utilisateur.
// Rôles supportés : ADMIN, ENSEIGNANT, ETUDIANT, PARENT.
// ============================================================

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import { verifyPassword } from './authUtils'

export const authOptions: NextAuthOptions = {

  // ── FOURNISSEUR D'AUTHENTIFICATION ──
  // Utilise les identifiants (email + mot de passe) — pas OAuth
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
        rememberMe: { label: 'Se souvenir', type: 'text' },
        academicSession: { label: 'Session', type: 'text' } // Session académique choisie à la connexion
      },

      // ── LOGIQUE D'AUTORISATION : Vérification des credentials ──
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        const rememberMe = credentials.rememberMe === 'true'
        
        // Recherche de l'utilisateur avec tous ses profils liés (étudiant, enseignant, etc.)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            etudiant: true,
            enseignant: true,
            administrateur: true,
            parent: true
          }
        })

        // Vérifications de sécurité successives
        if (!user) {
          throw new Error('Utilisateur non trouvé')
        }
        if (!user.actif) {
          throw new Error('Votre compte est désactivé. Contactez l\'administrateur.')
        }

        // Comparaison du mot de passe avec le hash bcrypt stocké en base
        const isValid = await verifyPassword(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Mot de passe incorrect')
        }

        // ── Mise à jour des métadonnées de connexion ──
        await prisma.user.update({
          where: { id: user.id },
          data: { derniereConnexion: new Date() } // Horodatage de la dernière connexion
        })

        // ── Enregistrement de l'événement d'authentification dans les logs ──
        await prisma.log.create({
          data: {
            userId: user.id,
            action: 'CONNEXION',
            typeaction: 'AUTH',
            statut: 'SUCCES',
            adresseip: '0.0.0.0',
            useragent: 'User Agent'
          }
        })

        // ── Retourne les données utilisateur qui alimenteront le token JWT ──
        return {
          id: user.id,
          email: user.email,
          name: `${user.nom} ${user.prenom}`, // Nom complet pour l'affichage
          role: user.role,
          academicSession: credentials.academicSession,
          etudiantId: user.etudiant?.id,
          enseignantId: user.enseignant?.id,
          parentId: user.parent?.id
        }
      }
    })
  ],

  // ── CALLBACKS JWT & SESSION ──
  // Permettent d'enrichir le token et la session avec des données custom
  callbacks: {
    // Appelé à la création/rafraîchissement du token — injecte les données métier
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.academicSession = user.academicSession
        token.etudiantId = user.etudiantId
        token.enseignantId = user.enseignantId
        token.parentId = user.parentId
      }
      return token
    },
    // Appelé à chaque accès à `useSession()` — expose les données du token côté client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.academicSession = token.academicSession
        session.user.etudiantId = token.etudiantId
        session.user.enseignantId = token.enseignantId
        session.user.parentId = token.parentId
      }
      return session
    }
  },

  // ── PAGES PERSONNALISÉES ──
  pages: {
    signIn: '/login', // Redirection vers la page de connexion custom
    error: '/login'   // En cas d'erreur d'auth, reste sur /login
  },

  // ── CONFIGURATION DE SESSION ──
  session: {
    strategy: 'jwt',         // Stockage stateless (pas de base de données pour les sessions)
    maxAge: 24 * 60 * 60    // Durée de vie : 24 heures (en secondes)
  },

  secret: process.env.NEXTAUTH_SECRET // Clé secrète pour signer les tokens
}

export default authOptions
