import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Fetch the class with principal teacher and subjects
    const classe = await prisma.classe.findUnique({
      where: { id, actif: true },
      include: {
        professeurprincipal: {
          include: {
            user: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        matieres: {
          include: {
            matiere: true
          }
        }
      }
    })

    if (!classe) {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 })
    }

    // Vérification supprimée : Permettre à l'enseignant de visualiser les informations 
    // de toute classe à laquelle il accède (depuis son interface).

    // Format matieres for the frontend expectation
    const formattedMatieres = classe.matieres.map(cm => ({
      id: cm.matiere.id,
      code: cm.matiere.code,
      intitule: cm.matiere.intitule,
      coefficient: cm.matiere.credits // Fallback to credits if coefficient not present
    }))

    const result = {
      id: classe.id,
      nom: classe.nom,
      filiere: classe.filiere,
      niveau: classe.niveau,
      anneeacademique: classe.anneeacademique,
      capacitemax: classe.capacitemax,
      professeurPrincipal: classe.professeurprincipal ? {
        user: {
          nom: classe.professeurprincipal.user.nom,
          prenom: classe.professeurprincipal.user.prenom
        }
      } : null,
      matieres: formattedMatieres
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails de la classe' },
      { status: 500 }
    )
  }
}
