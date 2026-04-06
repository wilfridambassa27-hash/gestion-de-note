import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ETUDIANT' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json([], { status: 200 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' as const },
      take: 15,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Erreur notifications étudiant:", error)
    return NextResponse.json([])
  }
}
