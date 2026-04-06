import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // ONLINE = last activity within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const onlineCount = await prisma.user.count({
      where: {
        derniereConnexion: {
          gte: fiveMinutesAgo
        }
      }
    })

    return NextResponse.json({ onlineCount })
  } catch (error) {
    console.error('Error fetching online stats:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
