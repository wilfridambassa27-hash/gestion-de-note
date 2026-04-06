import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const etudiants = await prisma.etudiant.findMany({
      where: { classeId: id },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true
          }
        },
        notes: {
          select: { valeur: true }
        },
        bulletins: {
          orderBy: { dategeneration: 'desc' },
          take: 1,
          select: { moyennegenerale: true }
        }
      },
      // matricule is a direct field on Etudiant (not a relation)
      orderBy: {
        user: {
          nom: 'asc'
        }
      }
    })

    return NextResponse.json(etudiants)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des étudiants' },
      { status: 500 }
    )
  }
}
