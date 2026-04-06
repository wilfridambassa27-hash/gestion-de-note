// ============================================================
// prisma.ts — Instance Singleton du client Prisma ORM
// Garantit une seule connexion à la base de données PostgreSQL
// en développement (hot-reload) et en production.
// ============================================================

import { PrismaClient } from '@prisma/client'

// ── Déclaration globale pour éviter la multiplication des instances ──
// En développement avec hot-reload, Next.js recharge les modules
// mais la variable globale persiste entre les rechargements.
declare global {
  var prisma: PrismaClient | undefined
}

// ── Factory : réutilise l'instance globale si elle existe déjà ──
const prismaClientSingleton = () => {
  return global.prisma ?? new PrismaClient()
}

// Instance partagée dans toute l'application
export const prisma = prismaClientSingleton()

// ── En développement seulement : stocke l'instance dans le scope global ──
// Cela évite la création d'une nouvelle connexion à chaque hot-reload
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
