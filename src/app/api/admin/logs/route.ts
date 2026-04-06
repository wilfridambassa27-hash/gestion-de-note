import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Prisma.LogWhereInput = {}
    if (type) {
      where.typeaction = type
    }

    const logs = await prisma.log.findMany({
      where,
      take: limit,
      orderBy: { dateaction: 'desc' },
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logs' },
      { status: 500 }
    )
  }
}
