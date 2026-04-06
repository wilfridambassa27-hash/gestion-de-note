import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // 1. Récupérer le semestre actif
    const semestreActif = await prisma.semestre.findFirst({
      where: { actif: true }
    }) || await prisma.semestre.findFirst({ orderBy: { datedebut: 'desc' } })

    if (!semestreActif) {
      return NextResponse.json({ error: 'Aucun semestre actif trouvé' }, { status: 404 })
    }

    // 2. Récupérer tous les étudiants avec leurs classes
    const etudiants = await prisma.etudiant.findMany({
      include: {
        user: { select: { nom: true, prenom: true } },
        classe: {
          select: {
            id: true,
            nom: true,
            filiere: true,
            matieres: {
              where: { semestre: semestreActif.libelle }
            }
          }
        },
        notes: {
          where: { semestreId: semestreActif.id },
          select: { matiereId: true },
          distinct: ['matiereId']
        }
      }
    })

    // 3. Calculer les statistiques par étudiant
    const statsEtudiants = etudiants.map(e => {
      const totalMatieres = e.classe?.matieres?.length || 0
      const notesSaisies = e.notes.length
      const progression = totalMatieres > 0 ? (notesSaisies / totalMatieres) * 100 : 0
      
      return {
        id: e.matricule,
        nom: `${e.user.nom} ${e.user.prenom}`,
        filiere: e.classe?.filiere || e.classe?.nom || 'Inconnue',
        status: notesSaisies >= totalMatieres && totalMatieres > 0 ? 'Complet' : 'Partiel',
        notes: `${notesSaisies}/${totalMatieres}`,
        progression: Math.round(progression)
      }
    })

    // 4. Statistiques globales
    const totalEtudiants = etudiants.length
    const complets = statsEtudiants.filter(s => s.status === 'Complet').length
    const progressionGlobale = totalEtudiants > 0 ? (complets / totalEtudiants) * 100 : 0

    return NextResponse.json({
      progressionGlobale: Math.round(progressionGlobale),
      totalEtudiants,
      complets,
      enAttente: totalEtudiants - complets,
      etudiants: statsEtudiants
    })

  } catch (error) {
    console.error('API_RETROGRAPHIE_ERROR:', error)
    return NextResponse.json({ error: 'Erreur récupération statistiques' }, { status: 500 })
  }
}
