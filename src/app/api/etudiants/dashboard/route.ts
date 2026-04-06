import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ETUDIANT' && session.user.role !== 'PARENT')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Find the student based on user ID
    const etudiant = await prisma.etudiant.findFirst({
      where: {
        userId: session.user.id
      },
      include: {
        classe: true,
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    })

    if (!etudiant) {
      return NextResponse.json(
        { error: 'Etudiant non trouvé' },
        { status: 404 }
      )
    }

    // Get student's notes
    const notes = await prisma.note.findMany({
      where: {
        etudiantId: etudiant.id
      },
      include: {
        matiere: true,
        evaluation: true
      },
      orderBy: {
        datenote: 'desc'
      },
      take: 20
    })

    // Calculate average by subject
    const notesByMatiere: Record<string, { total: number; count: number }> = {}
    notes.forEach((note) => {
      const matiereId = note.matiereId
      if (!notesByMatiere[matiereId]) {
        notesByMatiere[matiereId] = { total: 0, count: 0 }
      }
      const credits = note.matiere?.credits || 1
      notesByMatiere[matiereId].total += note.valeur * credits
      notesByMatiere[matiereId].count += credits
    })

    const matieres = await Promise.all(
      Object.entries(notesByMatiere).map(async ([matiereId, data]) => {
        const matiere = await prisma.matiere.findUnique({
          where: { id: matiereId }
        })
        return {
          id: matiereId,
          nom: matiere?.intitule || 'Inconnue',
          moyenne: data.count > 0 ? Number((data.total / data.count).toFixed(2)) : 0,
          credits: matiere?.credits || 1
        }
      })
    )

    // Calculate overall average
    const totalWeighted = notes.reduce((sum: number, note) => sum + note.valeur * (note.matiere?.credits || 1), 0)
    const totalCredits = notes.reduce((sum: number, note) => sum + (note.matiere?.credits || 1), 0)
    const moyenne = totalCredits > 0 ? Number((totalWeighted / totalCredits).toFixed(2)) : 0

    // Get recent bulletins
    const bulletins = await prisma.bulletin.findMany({
      where: {
        etudiantId: etudiant.id
      },
      orderBy: {
        dategeneration: 'desc'
      },
      take: 3
    })

    // Format notes for response
    const formattedNotes = notes.slice(0, 10).map((note) => ({
      id: note.id,
      matiere: note.matiere?.intitule || 'Inconnue',
      valeur: note.valeur,
      date: note.datenote.toISOString().split('T')[0],
      credits: note.matiere?.credits || 1,
      type: (note as any).evaluation?.type || 'CC'
    }))

    return NextResponse.json({
      etudiant: {
        id: etudiant.id,
        matricule: etudiant.matricule,
        nom: etudiant.user.nom,
        prenom: etudiant.user.prenom,
        classe: etudiant.classe?.nom || 'Non assigné',
        niveau: etudiant.classe?.niveau || ''
      },
      moyenne,
      matieres,
      notes: formattedNotes,
      bulletins: bulletins.map((b) => ({
        id: b.id,
        moyenne: b.moyennegenerale,
        semestre: b.semestreId,
        decision: b.decision,
        date: b.dategeneration.toISOString().split('T')[0]
      })),
      totalNotes: notes.length
    })

  } catch (error) {
    console.error('Erreur dashboard etudiant:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}
