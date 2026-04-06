import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = Promise<{ id: string }>

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id: etudiantId } = await params
    const body = await request.json()
    const { matricule, filiere, classeId, session } = body

    if (!matricule || !filiere || !classeId || !session) {
      return NextResponse.json(
        { error: 'Tous les champs (Matricule, Filière, Classe, Session) sont requis.' },
        { status: 400 }
      )
    }

    // Récupérer l'étudiant avec sa classe incluse
    const etudiant = await prisma.etudiant.findUnique({
      where: { id: etudiantId },
      include: { classe: true }
    })

    if (!etudiant) {
      return NextResponse.json({ error: 'Étudiant introuvable dans la base de données.' }, { status: 404 })
    }

    // Vérifier le matricule en priorité
    if (etudiant.matricule !== matricule) {
      return NextResponse.json({ error: 'Matricule incorrect. Veuillez vérifier votre numéro étudiant.' }, { status: 403 })
    }

    if (!etudiant.classeId) {
      return NextResponse.json(
        { error: 'Vous n\'êtes actuellement inscrit dans aucune classe. Veuillez contacter l\'administration.' },
        { status: 403 }
      )
    }

    if (etudiant.classeId !== classeId) {
      return NextResponse.json({ error: 'Vous n\'êtes pas inscrit dans cette classe. Veuillez choisir la bonne classe.' }, { status: 403 })
    }

    if (etudiant.classe?.filiere !== filiere) {
      return NextResponse.json({ error: 'La filière sélectionnée ne correspond pas à votre profil d\'inscription.' }, { status: 403 })
    }

    if (etudiant.classe?.anneeacademique !== session) {
      return NextResponse.json({ error: 'La session académique saisie est invalide pour votre classe.' }, { status: 403 })
    }

    // Tout est correct
    return NextResponse.json({ 
      success: true, 
      message: 'Vérification réussie ! Bienvenue dans votre espace étudiant.' 
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Erreur API Verify Class:', message)
    return NextResponse.json(
      { error: 'Erreur interne lors de la vérification. Contactez l\'administration.' },
      { status: 500 }
    )
  }
}
