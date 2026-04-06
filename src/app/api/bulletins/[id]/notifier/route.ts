import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id // bulletin ID

    const bulletin = await prisma.bulletin.update({
      where: { id },
      data: {
        notificationsEnvoyees: true,
        datepublication: new Date(),
        statut: 'PUBLIE'
      },
      include: {
        etudiant: {
          include: {
            user: true
          }
        }
      }
    })

    // In a real app, send email/SMS/Push here
    console.log(`Notification envoyée à ${bulletin.etudiant.user.email} pour le bulletin ${id}`)

    return NextResponse.json({
      success: true,
      message: `Notifications envoyées avec succès pour ${bulletin.etudiant.user.nom} ${bulletin.etudiant.user.prenom}`
    })

  } catch (error) {
    console.error('Erreur notification:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi des notifications' }, { status: 500 })
  }
}
