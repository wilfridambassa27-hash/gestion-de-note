import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const periode = searchParams.get('periode') || 'mois'
  const limit = parseInt(searchParams.get('limit') || '12')

  try {
    const now = new Date()
    let fromDate: Date
    
    switch (periode) {
      case 'mois':
        fromDate = new Date(now.getFullYear(), now.getMonth() - limit + 1, 1)
        break
      case 'annee':
        fromDate = new Date(now.getFullYear() - 1, 0, 1)
        break
      case 'semestre':
        fromDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 6) * 6 - 6, 1)
        break
      default:
        fromDate = new Date(now.getTime() - limit * 24 * 60 * 60 * 1000)
    }

    const logs = await prisma.log.groupBy({
      by: ['dateaction'],
      where: {
        dateaction: {
          gte: fromDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        dateaction: 'asc'
      }
    })

    // Group by month/semester/year
    const stats = logs.reduce((acc, log) => {
      const date = new Date(log.dateaction)
      const key = date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: periode === 'mois' ? 'short' : periode === 'semestre' ? 'short' : 'numeric'
      })
      
      if (!acc[key]) {
        acc[key] = 0
      }
      acc[key] += log._count.id
      return acc
    }, {} as Record<string, number>)

    // Format for charts
    const chartData = Object.entries(stats).map(([label, value]) => ({
      name: label,
      operations: value,
      uv: value // Recharts compatibility
    }))

    return NextResponse.json({
      periode,
      chartData,
      totalOperations: logs.reduce((sum, log) => sum + log._count.id, 0),
      fromDate: fromDate.toISOString(),
      logsCount: logs.length
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Erreur stats' }, { status: 500 })
  }
}

