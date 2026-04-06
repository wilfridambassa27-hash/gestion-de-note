import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const qrcodes = await prisma.qRCode.findMany({
      include: {
        bulletin: {
          include: {
            etudiant: {
              include: {
                user: true
              }
            },
            semestre: true
          }
        }
      },
      orderBy: { dategeneration: 'desc' }
    })

    return NextResponse.json(qrcodes)
  } catch (error) {
    console.error('Erreur admin qrcodes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
