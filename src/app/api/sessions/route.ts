import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const semestres = await prisma.semestre.findMany({
      select: { anneeacademique: true },
      distinct: ['anneeacademique'],
      orderBy: { anneeacademique: 'desc' }
    })

    const sessions = semestres.map(s => s.anneeacademique) || ['2024-2025', '2023-2024']

    if (sessions.length === 0) return NextResponse.json(['2024-2025'])

    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json(['2024-2025']) // Fallback
  }
}
