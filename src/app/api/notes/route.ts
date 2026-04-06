import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'
import { verifierEtNotifierReleve } from '@/lib/retrographie'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const etudiantId = searchParams.get('etudiantId')
    const classeId = searchParams.get('classeId')
    const matiereId = searchParams.get('matiereId')
    const semestreId = searchParams.get('semestreId')
    const saisiparId = searchParams.get('saisiparId')

    let effectiveSaisiparId = saisiparId
    if (effectiveSaisiparId) {
      const enseignant = await prisma.enseignant.findFirst({
        where: { 
          OR: [
            { id: effectiveSaisiparId },
            { userId: effectiveSaisiparId }
          ]
        }
      })
      if (enseignant) effectiveSaisiparId = enseignant.id
    }

    const whereClause: Prisma.NoteWhereInput = {}
    if (etudiantId) whereClause.etudiantId = etudiantId
    if (classeId) whereClause.etudiant = { classeId }
    if (matiereId) whereClause.matiereId = matiereId
    if (semestreId) whereClause.semestreId = semestreId
    if (effectiveSaisiparId) whereClause.saisiparId = effectiveSaisiparId

    const rawNotes = await (prisma as any).note.findMany({
      where: whereClause,
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
    }) as any[]

    const notes = rawNotes.map(n => ({
      ...n,
      typenote: n.evaluation?.type || 'INCONNU',
      coefficient: n.evaluation?.coefficient || 1
    }))

    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'VIEW',
        type: 'NOTE',
        description: `Consultation des notes${etudiantId ? ' d\'un étudiant' : ''}`,
        details: { count: notes.length }
      })
    }

    return NextResponse.json(notes)
  } catch (error) {
    console.error('API_NOTES_GET_ERROR:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { notes, saisiparId, semestreId: requestedSemestreId } = body

    if (!notes || !Array.isArray(notes)) {
      return NextResponse.json({ error: 'Payload invalide : Tableau "notes" requis' }, { status: 400 })
    }

    // Récupérer le semestre actif si non spécifié
    let semestreId = requestedSemestreId
    if (!semestreId) {
      const semestreActif = await prisma.semestre.findFirst({ where: { actif: true } })
      semestreId = semestreActif?.id || (await prisma.semestre.findFirst({ orderBy: { datedebut: 'asc' } }))?.id
    }

    // Résoudre l'ID de l'enseignant (User ID -> Enseignant ID)
    let effectiveTeacherId = saisiparId || session?.user?.id
    if (effectiveTeacherId) {
      const enseignant = await prisma.enseignant.findFirst({
        where: { 
          OR: [
            { id: effectiveTeacherId },
            { userId: effectiveTeacherId }
          ]
        }
      })
      if (enseignant) effectiveTeacherId = enseignant.id
    }

    if (!semestreId) {
       return NextResponse.json({ error: 'Aucun semestre identifié pour la sauvegarde' }, { status: 400 })
    }

    const createdNotes = await Promise.all(
      notes.map(async (note: any) => {
        if (!note.etudiantId || !note.matiereId || note.valeur === undefined) {
           throw new Error('Champs obligatoires manquants (Etudiant, Matière ou Valeur)')
        }

        // Résoudre l'ID de l'étudiant si nécessaire (User ID -> Etudiant ID)
        let resolvedEtudiantId = note.etudiantId
        const etudiant = await prisma.etudiant.findFirst({
          where: { OR: [{ id: resolvedEtudiantId }, { userId: resolvedEtudiantId }] },
          select: { id: true }
        })
        if (etudiant) resolvedEtudiantId = etudiant.id

        const typeEvaluation = note.typenote || 'CC'
        const coefficient = parseInt(note.coefficient) || 1
        
        // 1. Recherche ou création automatique de l'Evaluation associée
        let evaluation = await (prisma as any).evaluation.findFirst({
          where: {
            matiereId: note.matiereId,
            semestreId: semestreId,
            type: typeEvaluation
          }
        })

        if (!evaluation) {
          evaluation = await (prisma as any).evaluation.create({
            data: {
              type: typeEvaluation,
              matiereId: note.matiereId,
              semestreId: semestreId,
              coefficient: coefficient,
              date: note.datenote ? new Date(note.datenote) : new Date()
            }
          })
        }

        // 2. Upsert de la Note
        return (prisma as any).note.upsert({
          where: {
            etudiantId_evaluationId: {
              etudiantId: resolvedEtudiantId,
              evaluationId: evaluation.id
            }
          },
          update: {
            valeur: parseFloat(note.valeur),
            datenote: note.datenote ? new Date(note.datenote) : undefined,
            saisiparId: effectiveTeacherId
          },
          create: {
            valeur: parseFloat(note.valeur),
            datenote: note.datenote ? new Date(note.datenote) : new Date(),
            etudiantId: resolvedEtudiantId,
            matiereId: note.matiereId,
            semestreId: semestreId,
            evaluationId: evaluation.id,
            saisiparId: effectiveTeacherId
          }
        })
      })
    )

    // DÉCLENCHER LA RÉTROGRAPHIE
    try {
      const uniqueEtudiants = [...new Set(notes.map((n: any) => n.etudiantId))]
      await Promise.all(
        uniqueEtudiants.map(id => verifierEtNotifierReleve(id as string, semestreId))
      )
    } catch (retroErr) {
      console.error("Erreur rétrographie:", retroErr)
    }

    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'UPDATE',
        type: 'NOTE',
        description: `${createdNotes.length} note(s) certifiée(s) par ${session.user.name}`,
        details: { count: createdNotes.length }
      })

      // NOTIFIER TOUS LES ADMINS
      try {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN', actif: true },
          select: { id: true }
        })

        if (admins.length > 0) {
          const teacherName = session.user.name || "Un enseignant"
          await prisma.notification.createMany({
            data: admins.map(admin => ({
              userId: admin.id,
              title: "📊 Nouvelle Saisie de Notes",
              message: `${teacherName} a enregistré ${createdNotes.length} note(s) dans le système.`,
              type: "INFO"
            }))
          })
        }
      } catch (notifErr) {
        console.error("Erreur creation notifications admin:", notifErr)
      }
    }

    return NextResponse.json({ success: true, count: createdNotes.length, notes: createdNotes }, { status: 201 })
  } catch (error: any) {
    console.error('API_NOTES_POST_ERROR:', error.message)
    return NextResponse.json({ error: error.message || 'Erreur lors de la sauvegarde' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('id')

    if (!noteId) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    await prisma.note.delete({ where: { id: noteId } })

    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'DELETE',
        type: 'NOTE',
        description: 'Suppression d\'une note certifiée'
      })
    }

    return NextResponse.json({ message: 'Note supprimée' })
  } catch (error) {
    console.error('API_NOTES_DELETE_ERROR:', error)
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}
