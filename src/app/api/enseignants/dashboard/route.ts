import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getCurrentAcademicSession } from '@/lib/sessionUtils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionParam = searchParams.get('session')
    
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ENSEIGNANT') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const user = session.user as { id: string; role: string; email: string; academicSession?: string }
    const academicSession = sessionParam || user.academicSession || (await getCurrentAcademicSession())

    // Find the teacher profile by User ID
    const enseignant = await prisma.enseignant.findFirst({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { nom: true, prenom: true, email: true }
        }
      }
    })

    if (!enseignant) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 })
    }

    // Parallel fetching for performance
    const [classesPrincipales, matieres, recentNotes, pendingNotes] = await Promise.all([
      prisma.classe.findMany({
        where: { professeurprincipalId: enseignant.id, anneeacademique: academicSession },
        include: { _count: { select: { etudiants: true } } }
      }),
      prisma.classeMatiere.findMany({
        where: { enseignantId: enseignant.id, classe: { anneeacademique: academicSession } },
        include: { matiere: true, classe: true }
      }),
      prisma.note.findMany({
        where: { saisiparId: enseignant.id, semestre: { anneeacademique: academicSession } },
        include: {
          etudiant: { include: { user: { select: { nom: true, prenom: true } } } },
          matiere: true,
          evaluation: true
        },
        orderBy: { datenote: 'desc' },
        take: 10
      }),
      prisma.note.findMany({
        where: { saisiparId: enseignant.id, validee: false, semestre: { anneeacademique: academicSession } },
        include: {
          etudiant: { include: { user: { select: { nom: true, prenom: true } } } },
          matiere: true,
          evaluation: true
        },
        orderBy: { datenote: 'desc' },
        take: 5
      })
    ])

    const classIds = matieres.map((m) => m.classeId)
    const etudiantsCount = await prisma.etudiant.count({ where: { classeId: { in: classIds } } })
    const matiereIds = matieres.map((m) => m.matiereId)

    // PostgreSQL specific logic for stats and charts
    // 1. Top Classes by AVG notes (PostgreSQL syntax corrigée)
    const topClassesRaw = await prisma.$queryRawUnsafe(`
      SELECT c.id, c.nom, AVG(n.valeur) as avg_note, COUNT(n.id) as note_count
      FROM "Classe" c
      JOIN "ClasseMatiere" cm ON c.id = cm."classeId"
      LEFT JOIN "Etudiant" e ON e."classeId" = c.id
      LEFT JOIN "Note" n ON n."etudiantId" = e.id AND n."matiereId" = cm."matiereId"
      WHERE cm."enseignantId" = $1
        AND c.anneeacademique = $2
      GROUP BY c.id, c.nom
      ORDER BY avg_note DESC NULLS LAST
      LIMIT 3
    `, enseignant.id, academicSession) as any[]

    const topClasses = topClassesRaw.map(row => ({
      id: row.id,
      nom: row.nom,
      avg_note: Number(row.avg_note || 0).toFixed(2),
      note_count: Number(row.note_count || 0)
    }))

    const notesByMonthRaw = await prisma.$queryRawUnsafe(`
      SELECT 
        TO_CHAR(n.datenote, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM "Note" n
      JOIN "ClasseMatiere" cm ON n."matiereId" = cm."matiereId"
      JOIN "Classe" c ON cm."classeId" = c.id
      WHERE cm."enseignantId" = $1
        AND c.anneeacademique = $2
        AND n.datenote >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(n.datenote, 'YYYY-MM')
      ORDER BY month ASC
    `, enseignant.id, academicSession) as any[]

    const notesByMonth = notesByMonthRaw.map(row => ({
      month: row.month,
      count: Number(row.count)
    }))

    const moyenneGenerale = await prisma.note.aggregate({
      where: { matiereId: { in: matiereIds } },
      _avg: { valeur: true }
    }).then(res => res._avg.valeur || 0)

    const notesEnAttenteCount = await prisma.note.count({
      where: { matiereId: { in: matiereIds }, validee: false, semestre: { anneeacademique: academicSession } }
    })

    return NextResponse.json({
      enseignant: {
        id: enseignant.id,
        matricule: enseignant.matricule,
        nom: enseignant.user.nom,
        prenom: enseignant.user.prenom,
        specialite: enseignant.specialite
      },
      stats: {
        totalEleves: etudiantsCount,
        notesSaisies: recentNotes.length,
        moyenneGenerale: Number(moyenneGenerale.toFixed(2)),
        notesEnAttente: notesEnAttenteCount,
        classesCount: classesPrincipales.length,
        matieresCount: matieres.length
      },
      classes: classesPrincipales.map(c => ({ id: c.id, nom: c.nom, effectif: c._count.etudiants, moyenne: 0 })),
      matieres: matieres.map(m => ({ id: m.matiere.id, nom: m.matiere.intitule, code: m.matiere.code, classe: m.classe.nom, credits: m.matiere.credits })),
      recentNotes: recentNotes.map(n => ({ id: n.id, etudiant: `${n.etudiant.user.prenom} ${n.etudiant.user.nom}`, matiere: n.matiere.intitule, valeur: n.valeur, type: (n as any).evaluation?.type || 'CC', date: n.datenote.toISOString().split('T')[0], validee: n.validee })),
      pendingNotes: pendingNotes.map(n => ({ id: n.id, etudiant: `${n.etudiant.user.prenom} ${n.etudiant.user.nom}`, matiere: n.matiere.intitule, valor: n.valeur, type: (n as any).evaluation?.type || 'CC', date: n.datenote.toISOString().split('T')[0] })),
      notesByMonth,
      topClasses
    })

  } catch (error) {
    console.error('Erreur dashboard enseignant:', error)
    return NextResponse.json({ error: 'Erreur technique (Postgres)' }, { status: 500 })
  }
}
