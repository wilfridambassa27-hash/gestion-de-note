import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id // note ID
    const { motif, description } = await request.json()

    if (!motif) {
      return NextResponse.json({ error: 'Motif requis' }, { status: 400 })
    }

    // Le modèle n'existe pas dans le nouveau schema. Mock response.
    const contestation = {
      id: "mock-id",
      noteId: id,
      motif,
      description,
      statut: 'EN_ATTENTE'
    }

    return NextResponse.json({
      success: true,
      contestation
    })

  } catch (error) {
    console.error('Erreur contestation:', error)
    return NextResponse.json({ error: 'Erreur lors du dépôt de la contestation' }, { status: 500 })
  }
}
