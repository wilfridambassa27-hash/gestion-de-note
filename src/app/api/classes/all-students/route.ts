import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ENSEIGNANT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Fetch all students (simplified for now, usually should be limited to the teacher's classes)
    const students = await prisma.etudiant.findMany({
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            actif: true,
            derniereConnexion: true
          }
        },
        classe: {
          select: {
            nom: true
          }
        }
      },
      orderBy: {
        user: {
          nom: 'asc'
        }
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des étudiants' },
      { status: 500 }
    )
  }
}
