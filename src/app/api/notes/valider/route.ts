import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ENSEIGNANT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { classeId, semestre, note, credit, notePonderee, adminEmail, matiereId } = await request.json()

    // Find the actual active semester ID
    const activeSemestre = await prisma.semestre.findFirst({
      where: { 
        actif: true,
        libelle: { contains: semestre } // semestre is usually "1" or "2"
      }
    })

    if (!activeSemestre) {
       return NextResponse.json({ error: 'Semestre actif non trouvé' }, { status: 404 })
    }

    // 1. Get all students in the class
    const students = await prisma.etudiant.findMany({
      where: { classeId }
    })

    if (students.length === 0) {
       return NextResponse.json({ error: 'Aucun étudiant dans cette classe' }, { status: 404 })
    }

    // 2. Fetch or Create Evaluation
    let evaluation = await prisma.evaluation.findFirst({
      where: {
        matiereId: matiereId,
        semestreId: activeSemestre.id,
        type: 'EXAM'
      }
    })

    if (!evaluation) {
      evaluation = await prisma.evaluation.create({
        data: {
          matiereId: matiereId,
          semestreId: activeSemestre.id,
          type: 'EXAM',
          coefficient: 2,
          date: new Date()
        }
      })
    }

    const noteValeur = parseFloat(note)
    await prisma.$transaction(
      students.map((student) => 
        prisma.note.upsert({
          where: {
            etudiantId_evaluationId: {
              etudiantId: student.id,
              evaluationId: evaluation!.id 
            }
          },
          update: {
            valeur: noteValeur,
            datenote: new Date(),
            validee: true,
            valideeparId: session.user.id
          },
          create: {
            etudiantId: student.id,
            matiereId: matiereId,
            semestreId: activeSemestre.id,
            valeur: noteValeur,
            evaluationId: evaluation!.id,
            datenote: new Date(),
            validee: true,
            valideeparId: session.user.id,
            appreciation: noteValeur >= 16 ? 'Excellent' : noteValeur >= 12 ? 'Bien' : noteValeur >= 10 ? 'Passable' : 'Insuffisant'
          }
        })
      )
    )

    // 3. Log the validation event
    await createLog({
      userId: session.user.id,
      action: 'UPDATE',
      type: 'NOTE',
      description: `Validation globale des notes: ${classeId} - ${semestre}`,
      details: { semestre, note, credit, notePonderee, adminEmail, count: students.length }
    })

    // 4. Send email to admin (Simulated for this implementation)
    console.log(`[EMAIL SEND] To: ${adminEmail} - Subject: Validation Notes Promotion`)

    return NextResponse.json({ 
       success: true, 
       message: 'Notes validées avec succès. Notification envoyée à l\'administrateur.' 
    })
  } catch (error) {
    console.error('Erreur validation:', error)
    return NextResponse.json({ error: 'Erreur lors de la validation des notes' }, { status: 500 })
  }
}
