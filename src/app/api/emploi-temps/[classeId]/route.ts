import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classeId: string }> }
) {
  try {
    const { classeId } = await params

    const emplois = await prisma.emploiTemps.findMany({
      where: { classeId },
      include: {
        classe: { select: { nom: true } },
        enseignant: { 
          include: { user: { select: { nom: true, prenom: true } } }
        },
        matiere: true
      },
      orderBy: [
        { jour: 'asc' },
        { heureDebut: 'asc' }
      ]
    })

    return NextResponse.json(emplois)
  } catch (error) {
    console.error('Erreur GET emploi-temps:', error)
    return NextResponse.json(
      { error: 'Erreur récupération emploi du temps' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { classeId, jour, heureDebut, heureFin, enseignantId, matiereId, salle } = await request.json()

    if (!classeId || !jour || !heureDebut || !matiereId) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    // Check conflict
    const existing = await prisma.emploiTemps.findUnique({
      where: {
        classeId_jour_heureDebut: {
          classeId,
          jour,
          heureDebut
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Créneau déjà occupé' },
        { status: 409 }
      )
    }

    const emploi = await prisma.emploiTemps.create({
      data: {
        classeId,
        jour,
        heureDebut,
        heureFin,
        enseignantId,
        matiereId,
        salle
      },
      include: {
        classe: { select: { nom: true } },
        enseignant: { 
          include: { user: { select: { nom: true, prenom: true } } }
        },
        matiere: true
      }
    })

    return NextResponse.json(emploi, { status: 201 })
  } catch (error) {
    console.error('Erreur POST emploi-temps:', error)
    return NextResponse.json(
      { error: 'Erreur création créneau' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { id, jour, heureDebut, heureFin, enseignantId, matiereId, salle } = await request.json()

    const emploi = await prisma.emploiTemps.update({
      where: { id },
      data: {
        jour,
        heureDebut,
        heureFin,
        enseignantId,
        matiereId,
        salle
      },
      include: {
        classe: { select: { nom: true } },
        enseignant: { 
          include: { user: { select: { nom: true, prenom: true } } }
        },
        matiere: true
      }
    })

    return NextResponse.json(emploi)
  } catch (error) {
    console.error('Erreur PUT emploi-temps:', error)
    return NextResponse.json(
      { error: 'Erreur mise à jour créneau' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ classeId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await prisma.emploiTemps.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Créneau supprimé' })
  } catch (error) {
    console.error('Erreur DELETE emploi-temps:', error)
    return NextResponse.json(
      { error: 'Erreur suppression créneau' },
      { status: 500 }
    )
  }
}

