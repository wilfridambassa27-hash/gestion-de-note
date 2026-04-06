import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id: etudiantId } = await params
    const { searchParams } = new URL(request.url)
    const semestre = searchParams.get('semestre')

    // Security: Students can only access their own notes
    // Parents can only access their children's notes
    // Teachers and admins can access all notes
    const userRole = session.user.role
    const userEtudiantId = session.user.etudiantId
    const userParentId = session.user.parentId

    let authorized = false

    if (userRole === 'ADMIN' || userRole === 'ENSEIGNANT') {
      authorized = true
    } else if (userRole === 'ETUDIANT' && userEtudiantId === etudiantId) {
      authorized = true
    } else if (userRole === 'PARENT' && userParentId) {
      // Check if the parent is linked to this student
      const parent = await prisma.parent.findFirst({
        where: {
          id: userParentId,
          etudiantId: etudiantId
        }
      })
      authorized = !!parent
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Build the where clause
    const where: Prisma.NoteWhereInput = { etudiantId }
    
    // If semestre is provided (S1, S2), find the semestre by libelle
    if (semestre) {
      const semestreRecord = await prisma.semestre.findFirst({
        where: { libelle: semestre }
      })
      if (semestreRecord) {
        where.semestreId = semestreRecord.id
      }
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        matiere: true,
        evaluation: true,
        etudiant: {
          include: {
            user: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        }
      },
      orderBy: { datenote: 'desc' }
    })

    // Calculate statistics
    let moyenne = 0
    let totalCreditsSujets = 0
    let totalCreditsObtenus = 0

    if (notes.length > 0) {
      notes.forEach((note) => {
        const evalCoeff = (note as any).evaluation?.coefficient || 1
        moyenne += note.valeur * evalCoeff
        totalCreditsSujets += evalCoeff
        if (note.valeur >= 10) {
          totalCreditsObtenus += (note.matiere?.credits || 1) // Just counting credits obtained here
        }
      })
      moyenne = totalCreditsSujets > 0 ? Math.round((moyenne / totalCreditsSujets) * 100) / 100 : 0
    }

    // Get all notes for the student to calculate rank
    const allNotes = await prisma.note.findMany({
      where: where.semestreId ? { semestreId: where.semestreId } : {},
      include: {
        matiere: true,
        evaluation: true
      }
    })

    // Calculate average for each student in the same class
    const etudiant = await prisma.etudiant.findUnique({
      where: { id: etudiantId },
      include: { classe: true }
    })

    let rang = 1
    if (etudiant?.classeId) {
      const etudiantsClasse = await prisma.etudiant.findMany({
        where: { classeId: etudiant.classeId },
        include: {
          notes: {
            where: where.semestreId ? { semestreId: where.semestreId } : {},
            include: { matiere: true, evaluation: true }
          }
        }
      })

      const etudiantsMoyennes = etudiantsClasse.map((etud) => {
        const notesEtud = etud.notes
        let sum = 0
        let coef = 0
        notesEtud.forEach((note) => {
          const evalCoeff = (note as any).evaluation?.coefficient || 1
          sum += note.valeur * evalCoeff
          coef += evalCoeff
        })
        return {
          id: etud.id,
          moyenne: coef > 0 ? sum / coef : 0
        }
      })

      etudiantsMoyennes.sort((a, b) => b.moyenne - a.moyenne)
      const currentIndex = etudiantsMoyennes.findIndex((e) => e.id === etudiantId)
      rang = currentIndex >= 0 ? currentIndex + 1 : etudiantsMoyennes.length
    }

    return NextResponse.json({
      notes: notes.map((n) => ({
        ...n,
        credits: n.matiere?.credits || 1,
        evalCoefficient: (n as any).evaluation?.coefficient || 1,
        typenote: (n as any).evaluation?.type || 'CC'
      })),
      stats: {
        moyenne,
        credits: totalCreditsObtenus,
        rang,
        totalNotes: notes.length
      }
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    )
  }
}
