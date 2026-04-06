import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nomEtablissement, email, telephone, adresse, notifications, newsletter } = body

    // Ici, vous saverez dans la base de données avec Prisma
    // await prisma.settings.upsert({
    //   where: { id: '1' },
    //   update: { nomEtablissement, email, telephone, adresse, notifications, newsletter },
    //   create: { nomEtablissement, email, telephone, adresse, notifications, newsletter }
    // })

    // Simulation de sauvegarde réussie
    console.log('Paramètres sauvegardés:', {
      nomEtablissement,
      email,
      telephone,
      adresse,
      notifications,
      newsletter,
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Paramètres sauvegardés avec succès',
      data: {
        nomEtablissement,
        email,
        telephone,
        adresse,
        notifications,
        newsletter
      }
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des paramètres' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Ici, vous récupérez les paramètres depuis la base de données
    // const settings = await prisma.settings.findFirst()

    // Retourner les paramètres par défaut pour la démo
    return NextResponse.json({
      nomEtablissement: 'College EduNotes',
      email: 'admin@edunotes.edu',
      telephone: '+224 620 000 000',
      adresse: 'Conakry, Guinea',
      notifications: true,
      newsletter: false
    })
  } catch (error) {
    console.error('Erreur lors de la récupération:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}
