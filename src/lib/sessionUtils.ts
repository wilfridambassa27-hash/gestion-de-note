import prisma from './prisma'
import type { Session } from 'next-auth'

/**
 * Récupère dynamiquement l'année académique active à partir des semestres.
 * Si aucun semestre n'est actif, retourne '2025-2026' comme fallback de sécurité.
 */
export async function getCurrentAcademicSession(): Promise<string> {
  try {
    const activeSemestre = await prisma.semestre.findFirst({
      where: { actif: true },
      select: { anneeacademique: true }
    })

    if (activeSemestre?.anneeacademique) {
      return activeSemestre.anneeacademique
    }

    const latestSemestre = await prisma.semestre.findFirst({
      orderBy: { datefin: 'desc' },
      select: { anneeacademique: true }
    })

    return latestSemestre?.anneeacademique || '2025-2026'
  } catch (error) {
    console.error('Erreur détection session:', error)
    return '2025-2026'
  }
}

// Extend Prisma types for session filtering
declare module '@prisma/client' {
  interface Prisma {
    SessionWhereInput: {
      userId?: string
      academicSession?: string
    }
  }
}

export function withUserSession<T>(session: Session | null, callback: (userId: string, academicSession: string) => Promise<T>) {
  if (!session?.user?.id || !session.user.academicSession) {
    throw new Error('Session manquante ou invalide')
  }
  
  return callback(session.user.id, session.user.academicSession)
}

export async function findUserNotes(session: Session, etudiantId?: string) {
  return withUserSession(session, async (userId, academicSession) => {
    return prisma.note.findMany({
      where: {
        etudiantId: etudiantId || undefined,
        etudiant: {
          userId
        },
        semestre: {
          anneeacademique: academicSession
        }
      },
      include: {
        matiere: true,
        semestre: true
      },
      orderBy: {
        datenote: 'desc'
      }
    })
  })
}

export async function findUserClasses(session: Session) {
  return withUserSession(session, async (userId, academicSession) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enseignant: {
          include: {
            matieres: {
              where: {
                classe: { anneeacademique: academicSession }
              },
              include: {
                classe: true
              }
            }
          }
        }
      }
    })
    
    if (!user?.enseignant?.matieres) return []
    const classesMap = new Map()
    user.enseignant.matieres.forEach(m => {
      if (m.classe) classesMap.set(m.classe.id, m.classe)
    })
    return Array.from(classesMap.values())
  })
}

export async function findUserEtudiants(session: Session) {
  return withUserSession(session, async (userId, academicSession) => {
    const etudiants = await prisma.etudiant.findMany({
      where: {
        userId,
        classe: {
          anneeacademique: academicSession
        }
      },
      include: {
        classe: true
      }
    })
    
    return etudiants
  })
}

// Global query filter helper
export async function getSessionFilter(session: Session) {
  const userId = session.user.id
  const academicSession = session.user.academicSession || (await getCurrentAcademicSession())
  
  if (!userId) {
    throw new Error('Session invalide pour filtrage')
  }
  
  return {
    userId,
    academicSession
  }
}
