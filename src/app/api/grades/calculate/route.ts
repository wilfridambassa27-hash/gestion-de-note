import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { calcMoyenneGenerale, calcMoyennesParMatiere, calcCreditsObtenus, getMention, computeRanks } from '@/lib/gradeCalc'

// POST /api/grades/calculate
// Body: { classeId, semestreId }
// Returns computed moyennes, mentions, ranks for all students in the class
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SECRETAIRE', 'ENSEIGNANT'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { classeId, semestreId } = await request.json()
    if (!classeId) {
      return NextResponse.json({ error: 'classeId requis' }, { status: 400 })
    }

    const etudiants = await prisma.etudiant.findMany({
      where: { classeId },
      include: {
        user: { select: { nom: true, prenom: true } },
        notes: {
          where: semestreId ? { semestreId, validee: true } : { validee: true },
          include: { matiere: true },
        },
      },
    })

    // Get all matières for this class (for credits total)
    const classeMatieres = await prisma.classeMatiere.findMany({
      where: { classeId },
      include: { matiere: true },
    })
    const matiereCreditsMap: Record<string, number> = {}
    for (const cm of classeMatieres) {
      matiereCreditsMap[cm.matiereId] = cm.matiere?.credits || 1
    }

    const results = etudiants.map(e => {
      const noteEntries = e.notes.map(n => ({
        valeur: n.valeur,
        credits: n.matiere?.credits || 1,
        matiereId: n.matiereId,
      }))
      const moyenneGenerale = calcMoyenneGenerale(noteEntries)
      const moyennesParMatiere = calcMoyennesParMatiere(noteEntries)
      const { creditsObtenus, creditsTotal } = calcCreditsObtenus(moyennesParMatiere, matiereCreditsMap)
      const mention = getMention(moyenneGenerale)

      return {
        id: e.id,
        nom: e.user.nom,
        prenom: e.user.prenom,
        moyenne: moyenneGenerale,
        mention,
        creditsObtenus,
        creditsTotal,
        admis: moyenneGenerale >= 10,
        notesCount: e.notes.length,
        details: e.notes.map(n => ({
          matiereId: n.matiereId,
          matiereName: n.matiere?.intitule || '-',
          valeur: n.valeur,
          credits: n.matiere?.credits || 1,
        })),
      }
    })

    const ranked = computeRanks(results)

    // Summary stats
    const moyennes = ranked.map(r => r.moyenne)
    const stats = {
      effectif: ranked.length,
      admis: ranked.filter(r => r.admis).length,
      recales: ranked.filter(r => !r.admis).length,
      moyenneGenerale: moyennes.length > 0
        ? parseFloat((moyennes.reduce((a, b) => a + b, 0) / moyennes.length).toFixed(2))
        : 0,
      moyenneHaute: moyennes.length > 0 ? Math.max(...moyennes) : 0,
      moyenneBasse: moyennes.length > 0 ? Math.min(...moyennes) : 0,
    }

    return NextResponse.json({ eleves: ranked, stats, success: true })
  } catch (error) {
    console.error('Grade calc error:', error)
    return NextResponse.json({ error: 'Erreur lors du calcul' }, { status: 500 })
  }
}
