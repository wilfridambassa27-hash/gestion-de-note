import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { classeId } = body

    if (!classeId) {
      return NextResponse.json({ error: 'ID Classe requis' }, { status: 400 })
    }

    // Get the class and its students/notes
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: {
        etudiants: {
          include: {
            notes: true
          }
        }
      }
    })

    if (!classe) {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 })
    }

    // Create a backup/archive record
    // In a real system, we might have an Archive table. 
    // Here we'll use the Log system and a dedicated JSON file or a specialized table if it existed.
    // For this implementation, we will mark the class as archived by creating a log with full snapshot.
    
    await createLog({
      userId: session.user.id,
      action: 'ARCHIVE',
      type: 'CLASSE',
      description: `Classe archivée: ${classe.nom} (${classe.anneeacademique})`,
      details: {
        classeId: classe.id,
        nom: classe.nom,
        niveau: classe.niveau,
        filiere: classe.filiere,
        snapshot: {
          ...classe,
          etudiantsCount: classe.etudiants.length
        }
      }
    })

    // Optionally mark the class as inactive if archiving means "move out of active view"
    // await prisma.classe.update({ where: { id: classeId }, data: { actif: false } })

    return NextResponse.json({ success: true, message: 'Classe archivée avec succès' })
  } catch (error) {
    console.error('Erreur archivage:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'archivage' }, { status: 500 })
  }
}
