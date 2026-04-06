import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classeId = searchParams.get('classeId')
    const teacherId = searchParams.get('teacherId')

    let effectiveTeacherId = teacherId

    if (teacherId) {
      // Find the Enseignant profile for this User ID (bridge User <-> Enseignant)
      const enseignant = await prisma.enseignant.findFirst({
        where: { 
          OR: [
            { id: teacherId },
            { userId: teacherId }
          ]
        }
      })
      if (enseignant) {
        effectiveTeacherId = enseignant.id
      }
    }

    // Define the where condition based on filters
    const where: any = {}
    
    if (classeId) {
      where.classes = {
        some: {
          classeId: classeId,
          ...(effectiveTeacherId ? { enseignantId: effectiveTeacherId } : {})
        }
      }
    } else if (effectiveTeacherId) {
      where.classes = {
        some: {
          enseignantId: effectiveTeacherId
        }
      }
    }

    const matieres = await prisma.matiere.findMany({
      where,
      orderBy: { intitule: 'asc' }
    })

    return NextResponse.json(matieres)
  } catch (error) {
    console.error('Erreur Matieres API:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des matières' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { code, intitule, seuilreussite, credits } = body

    const matiere = await prisma.matiere.create({
      data: {
        code,
        intitule,
        seuilreussite: seuilreussite || 10,
        credits: credits || 0
      }
    })

    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'CREATE',
        type: 'MATIERE',
        description: `Nouvelle matière créée: ${intitule}`,
        details: { matiereId: matiere.id }
      })
    }

    return NextResponse.json(matiere, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur création matière' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { id, code, intitule, seuilreussite, credits } = body

    const matiere = await prisma.matiere.update({
      where: { id },
      data: { code, intitule, seuilreussite, credits }
    })

    if (session?.user?.id) {
       await createLog({ userId: session.user.id, action: 'UPDATE', type: 'MATIERE', description: `Modifié: ${intitule}` })
    }

    return NextResponse.json(matiere)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur modification matiere' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const matiereId = searchParams.get('id')
    if (!matiereId) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    await prisma.matiere.delete({ where: { id: matiereId } })
    return NextResponse.json({ message: 'Supprimé' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}
