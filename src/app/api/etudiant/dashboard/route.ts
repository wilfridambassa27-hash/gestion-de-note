import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { calcMoyenneGenerale, calcMoyennesParMatiere, calcCreditsObtenus, computeRanks } from '@/lib/gradeCalc'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ETUDIANT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Find the student record via userId
    const etudiant = await prisma.etudiant.findFirst({
      where: { userId: session.user.id },
      include: {
        user: { select: { nom: true, prenom: true, email: true, actif: true } },
        classe: {
          include: {
            matieres: { include: { matiere: true } }
          }
        },
        notes: {
          include: { matiere: true, semestre: true },
          orderBy: { datenote: 'desc' },
        },
      },
    })

    if (!etudiant) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    // Build note entries for calculation
    const noteEntries = etudiant.notes.map(n => ({
      valeur: n.valeur,
      credits: n.matiere?.credits || 1,
      matiereId: n.matiereId,
      evalCoefficient: (n as any).evaluation?.coefficient || 1
    }))

    const moyenneGenerale = calcMoyenneGenerale(noteEntries)
    const moyennesParMatiere = calcMoyennesParMatiere(noteEntries)

    // Build credits map from class matieres
    const matiereCreditsMap: Record<string, number> = {}
    for (const cm of etudiant.classe?.matieres || []) {
      matiereCreditsMap[cm.matiereId] = cm.matiere?.credits || 1
    }
    const { creditsObtenus, creditsTotal } = calcCreditsObtenus(moyennesParMatiere, matiereCreditsMap)

    // Get all students in the class to compute rank
    const classMates = await prisma.etudiant.findMany({
      where: { classeId: etudiant.classeId || undefined },
      include: {
        notes: { include: { matiere: true } }
      }
    })

    const ranks = computeRanks(
      classMates.map(e => ({
        id: e.id,
        moyenne: calcMoyenneGenerale(
          e.notes.map(n => ({ valeur: n.valeur, credits: n.matiere?.credits || 1, matiereId: n.matiereId, evalCoefficient: (n as any).evaluation?.coefficient || 1 }))
        ),
      }))
    )

    const myRank = ranks.find(r => r.id === etudiant.id)?.rang || 0

    return NextResponse.json({
      id: etudiant.id,
      matricule: etudiant.matricule,
      moyenneGenerale,
      rang: myRank,
      totalEleves: classMates.length,
      creditsObtenus,
      creditsTotal,
      classe: {
        nom: etudiant.classe?.nom || '',
        niveau: etudiant.classe?.niveau || '',
        filiere: etudiant.classe?.filiere || '',
      },
      notes: etudiant.notes.map(n => ({
        id: n.id,
        valeur: n.valeur,
        typenote: (n as any).evaluation?.type || 'CC',
        datenote: n.datenote,
        appreciation: n.appreciation,
        validee: n.validee,
        matiere: {
          intitule: n.matiere?.intitule || '',
          code: n.matiere?.code || '',
          credits: n.matiere?.credits || 1,
        },
        semestre: {
          libelle: n.semestre?.libelle || '',
        },
        evaluation: {
          type: (n as any).evaluation?.type || 'CC',
          coefficient: (n as any).evaluation?.coefficient || 1
        }
      })),
    })
  } catch (error) {
    console.error('Student dashboard error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
