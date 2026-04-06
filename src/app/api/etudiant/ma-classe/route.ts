import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ETUDIANT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Find the student's class
    const etudiant = await prisma.etudiant.findFirst({
      where: { userId: session.user.id },
      select: { classeId: true }
    })

    if (!etudiant || !etudiant.classeId) {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 })
    }

    // Get all students in this class
    const classmates = await prisma.etudiant.findMany({
      where: { classeId: etudiant.classeId },
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        },
        classe: {
          select: {
            filiere: true,
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

    // Filter by same filiere as the current student if needed, 
    // but the prompt says "enregistrer dans cette classe selon sa filiere" 
    // which likely means within the class, show students of the same filiere.
    // Usually classes are already pinned to a filiere in this schema.
    
    const formattedClassmates = classmates.map(c => ({
      id: c.id,
      nom: c.user.nom,
      prenom: c.user.prenom,
      matricule: c.matricule,
      filiere: c.classe?.filiere || 'N/A',
      email: c.user.email
    }))

    return NextResponse.json(formattedClassmates)
  } catch (error) {
    console.error('Ma Classe API Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
