import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { etudiantId, semestreId } = await request.json()

    if (!etudiantId || !semestreId) {
      return NextResponse.json({ error: 'Etudiant and Semestre are required' }, { status: 400 })
    }

    const bulletin = await prisma.bulletin.findUnique({
      where: {
        etudiantId_semestreId: {
          etudiantId,
          semestreId
        }
      }
    })

    if (!bulletin) {
      return NextResponse.json({ error: 'Bulletin non trouvé' }, { status: 404 })
    }

    await prisma.bulletin.update({
      where: { id: bulletin.id },
      data: {
        notificationsEnvoyees: true,
        datepublication: new Date(),
        statut: 'PUBLIE'
      }
    })

    return NextResponse.json({ success: true, message: 'Notifications envoyées' })

  } catch (error) {
    console.error('Erreur notification:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
