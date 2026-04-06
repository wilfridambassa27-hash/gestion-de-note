import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'
import { getCurrentAcademicSession } from '@/lib/sessionUtils'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    let teacherId = searchParams.get('teacherId')
    const sessionParam = searchParams.get('session')
    
    // Détection dynamique de la session
    const academicSession = sessionParam || (await getCurrentAcademicSession())

    const sessionRole = session?.user?.role

    let effectiveTeacherId: string | null = null
    if (teacherId) {
      const enseignant = await prisma.enseignant.findFirst({
        where: { 
          OR: [
            { id: teacherId },
            { userId: teacherId }
          ]
        }
      })
      effectiveTeacherId = enseignant?.id || null
    }

    // Autoriser ADMIN, ENSEIGNANT et ETUDIANT à voir toutes les classes par défaut (si pas de filtre teacherId)
    if (!effectiveTeacherId && sessionRole !== 'ADMIN' && sessionRole !== 'ENSEIGNANT' && sessionRole !== 'ETUDIANT') {
      return NextResponse.json([])
    }

    const whereClause: Prisma.ClasseWhereInput = { 
      actif: true,
      anneeacademique: academicSession 
    }

    // N'appliquer le filtre de l'enseignant que si le paramètre a été explicitement demandé
    if (effectiveTeacherId) {
      whereClause.OR = [
        { professeurprincipalId: effectiveTeacherId },
        {
          matieres: {
            some: {
              enseignantId: effectiveTeacherId
            }
          }
        }
      ]
    }

    const classes = await prisma.classe.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { etudiants: true }
        },
        emplois: {
          select: { salle: true }
        }
      },
      orderBy: { nom: 'asc' }
    })

    const classesWithStats = await Promise.all(classes.map(async (classe) => {
      const latestSemestre = await prisma.semestre.findFirst({
        where: { actif: true },
        orderBy: { datefin: 'desc' }
      })

      let moyenne = 0
      if (latestSemestre) {
        const bulletinsAvg = await prisma.bulletin.aggregate({
          where: {
            semestreId: latestSemestre.id,
            etudiant: { classeId: classe.id }
          },
          _avg: { moyennegenerale: true }
        })
        moyenne = bulletinsAvg._avg.moyennegenerale || 0
      }

      if (moyenne === 0) {
        const recentNotes = await prisma.note.findMany({
          where: { etudiant: { classeId: classe.id } },
          take: 100,
          select: { valeur: true }
        })
        if (recentNotes.length > 0) {
          moyenne = recentNotes.reduce((sum: number, n) => sum + n.valeur, 0) / recentNotes.length
        }
      }

      // Extrait les salles uniques de l'emploi du temps
      const sallesUniques = Array.from(new Set(
        (classe as any).emplois?.map((e: any) => e.salle).filter(Boolean)
      ))

      return {
        ...classe,
        moyenne: Number(moyenne.toFixed(2)),
        salles: sallesUniques
      }
    }))

    return NextResponse.json(classesWithStats)
  } catch (error) {
    console.error('Erreur Classes API:', error)
    return NextResponse.json({ error: 'Erreur classes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const body = await request.json()
  const classe = await prisma.classe.create({ data: { ...body, anneeacademique: body.anneeAcademique } })
  return NextResponse.json(classe, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const classe = await prisma.classe.update({ where: { id: body.id }, data: body })
  return NextResponse.json(classe)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  await prisma.classe.update({ where: { id: id! }, data: { actif: false } })
  return NextResponse.json({ message: 'Deleted' })
}
