import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'


export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ENSEIGNANT' && session.user.role !== 'ADMINISTRATEUR')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()

    // Find note
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        saisipar: {
          include: { user: { select: { nom: true, prenom: true } } }
        },
        matiere: true,
        etudiant: {
          include: { user: { select: { nom: true, prenom: true } } }
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note non trouvée' }, { status: 404 })
    }

    // Only validate own notes or admin
    if (session.user.role !== 'ADMINISTRATEUR' && note.saisiparId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé à valider cette note' }, { status: 403 })
    }

    if (note.validee) {
      return NextResponse.json({ error: 'Note déjà validée' }, { status: 400 })
    }

    // Update note
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        validee: true,
        valideeparId: session.user.id as string,
        datevalidation: new Date()
      }
    })

    // Log action
    await createLog({
      userId: session.user.id,
        action: 'VALIDATION' as const,
      type: 'NOTE',
      description: `Validation note ${note.valeur}/20 pour ${note.etudiant.user.prenom} ${note.etudiant.user.nom} en ${note.matiere.intitule}`,
      details: { noteId: id, etudiantId: note.etudiantId, matiereId: note.matiereId, enseignant: `${note.saisipar?.user.prenom} ${note.saisipar?.user.nom}` }
    })

    return NextResponse.json({
      success: true,
      note: updatedNote,
      message: 'Note validée avec succès'
    })

  } catch (error) {
    const noteId = await params.then(p => p.id)
    console.error(`Erreur validation note ${noteId}:`, error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


