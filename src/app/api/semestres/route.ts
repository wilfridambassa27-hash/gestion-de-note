import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'

// GET - Liste des semestres
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const actif = searchParams.get('actif')
    const cloture = searchParams.get('cloture')

    const where: Prisma.SemestreWhereInput = {}
    if (actif !== null) where.actif = actif === 'true'
    if (cloture !== null) where.cloture = cloture === 'true'

    const semestres = await prisma.semestre.findMany({
      where,
      orderBy: [
        { anneeacademique: 'desc' },
        { libelle: 'asc' }
      ],
      include: {
        _count: {
          select: { notes: true, bulletins: true }
        }
      }
    })

    return NextResponse.json(semestres)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des semestres' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau semestre
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que c'est un admin ou secretary
    if (!session || !['ADMIN', 'SECRETAIRE'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { libelle, datedebut, datefin, anneeacademique } = body

    if (!libelle || !datedebut || !datefin || !anneeacademique) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    const semestre = await prisma.semestre.create({
      data: {
        libelle,
        datedebut: new Date(datedebut),
        datefin: new Date(datefin),
        anneeacademique,
        actif: false,
        cloture: false
      }
    })

    // Log l'action
    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'CREATE',
        type: 'SEMESTRE',
        description: `Semestre créé: ${libelle} (${anneeacademique})`,
        details: { semestreId: semestre.id }
      })
    }

    return NextResponse.json(semestre, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du semestre' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un semestre
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SECRETAIRE'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID du semestre requis' },
        { status: 400 }
      )
    }

    // Vérifier si le semestre existe
    const existingSemestre = await prisma.semestre.findUnique({
      where: { id }
    })

    if (!existingSemestre) {
      return NextResponse.json(
        { error: 'Semestre non trouvé' },
        { status: 404 }
      )
    }

    const updates: Prisma.SemestreUpdateInput = { ...data }
    
    // Si on active ce semestre, désactiver les autres
    if (data.actif === true) {
      await prisma.semestre.updateMany({
        where: { id: { not: id } },
        data: { actif: false }
      })
    }

    const semestre = await prisma.semestre.update({
      where: { id },
      data: updates
    })

    // Log l'action
    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'UPDATE',
        type: 'SEMESTRE',
        description: `Semestre modifié: ${existingSemestre.libelle}`,
        details: { semestreId: id, updates: data }
      })
    }

    return NextResponse.json(semestre)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du semestre' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un semestre
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID du semestre requis' },
        { status: 400 }
      )
    }

    // Vérifier si le semestre a des notes
    const notesCount = await prisma.note.count({
      where: { semestreId: id }
    })

    if (notesCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un semestre avec des notes' },
        { status: 400 }
      )
    }

    const semestre = await prisma.semestre.delete({
      where: { id }
    })

    // Log l'action
    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'DELETE',
        type: 'SEMESTRE',
        description: `Semestre supprimé: ${semestre.libelle}`,
        details: { semestreId: id }
      })
    }

    return NextResponse.json({ message: 'Semestre supprimé avec succès' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du semestre' },
      { status: 500 }
    )
  }
}

