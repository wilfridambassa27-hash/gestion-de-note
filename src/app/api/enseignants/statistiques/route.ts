import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const semestreFilter = searchParams.get('semestre') // 's1' | 's2' | null

    // Récupérer le profil enseignant
    const enseignant = await prisma.enseignant.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    // ── 1. Notes saisies par l'enseignant ──────────────────────────
    const notesWhere: any = { saisiparId: enseignant?.id }
    if (semestreFilter) {
      const sems = await prisma.semestre.findMany({ where: { libelle: { contains: semestreFilter, mode: 'insensitive' } }, select: { id: true } })
      if (sems.length > 0) notesWhere.semestreId = { in: sems.map(s => s.id) }
    }

    const notesRaw = await prisma.note.findMany({
      where: notesWhere,
      include: {
        matiere: { select: { intitule: true, credits: true } },
        semestre: { select: { libelle: true, anneeacademique: true } },
        etudiant: {
          include: {
            classe: { select: { nom: true, filiere: true } }
          }
        }
      },
      orderBy: { datenote: 'asc' }
    })

    const totalNotes = notesRaw.length
    const valeurs = notesRaw.map(n => n.valeur)

    // Moyenne générale
    const moyenneGenerale = totalNotes > 0
      ? parseFloat((valeurs.reduce((a, b) => a + b, 0) / totalNotes).toFixed(2))
      : 0

    // Taux validation
    const notesValidees = notesRaw.filter(n => n.validee).length
    const tauxValidation = totalNotes > 0
      ? parseFloat(((notesValidees / totalNotes) * 100).toFixed(1))
      : 0

    // Mentions excellence (>= 16)
    const mentionsExcellence = valeurs.filter(v => v >= 16).length

    // ── 2. Distribution des notes ──────────────────────────────────
    const distributionData = [
      { name: '[0-5]',   value: valeurs.filter(v => v < 5).length,            fill: '#f43f5e' },
      { name: '[5-10]',  value: valeurs.filter(v => v >= 5 && v < 10).length,  fill: '#8b5cf6' },
      { name: '[10-12]', value: valeurs.filter(v => v >= 10 && v < 12).length, fill: '#6366f1' },
      { name: '[12-14]', value: valeurs.filter(v => v >= 12 && v < 14).length, fill: '#3b82f6' },
      { name: '[14-16]', value: valeurs.filter(v => v >= 14 && v < 16).length, fill: '#10b981' },
      { name: '[16-20]', value: valeurs.filter(v => v >= 16).length,           fill: '#f59e0b' },
    ]

    // ── 3. Évolution temporelle (par mois) ────────────────────────
    const moisMap: Record<string, { valeurs: number[]; scans: number }> = {}
    const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

    for (const note of notesRaw) {
      const d = new Date(note.datenote)
      const key = `${MOIS[d.getMonth()]} ${d.getFullYear()}`
      if (!moisMap[key]) moisMap[key] = { valeurs: [], scans: 0 }
      moisMap[key].valeurs.push(note.valeur)
      moisMap[key].scans++
    }

    const evolutionData = Object.entries(moisMap).map(([name, data]) => ({
      name,
      moyenne: parseFloat((data.valeurs.reduce((a, b) => a + b, 0) / data.valeurs.length).toFixed(1)),
      scan: data.scans,
      top: parseFloat(Math.max(...data.valeurs).toFixed(1)),
    }))

    // ── 4. Performance par classe ──────────────────────────────────
    const classeMap: Record<string, { nom: string; valeurs: number[]; count: number }> = {}
    for (const note of notesRaw) {
      const cn = note.etudiant.classe?.nom || 'Sans classe'
      if (!classeMap[cn]) classeMap[cn] = { nom: cn, valeurs: [], count: 0 }
      classeMap[cn].valeurs.push(note.valeur)
      classeMap[cn].count++
    }

    const classeData = Object.values(classeMap).map(c => ({
      name: c.nom.length > 18 ? c.nom.slice(0, 16) + '…' : c.nom,
      avg: parseFloat((c.valeurs.reduce((a, b) => a + b, 0) / c.valeurs.length).toFixed(1)),
      count: c.count,
    })).sort((a, b) => b.avg - a.avg)

    // ── 5. Radar data (performance par semestre / domaine) ─────────
    const matieresMap: Record<string, { nom: string; valeurs: number[] }> = {}
    for (const note of notesRaw) {
      const mn = note.matiere.intitule
      if (!matieresMap[mn]) matieresMap[mn] = { nom: mn, valeurs: [] }
      matieresMap[mn].valeurs.push(note.valeur)
    }

    // Prendre jusqu'à 6 matières pour le radar
    const radarData = Object.values(matieresMap)
      .slice(0, 6)
      .map(m => ({
        subject: m.nom.length > 14 ? m.nom.slice(0, 12) + '…' : m.nom,
        moyenne: parseFloat((m.valeurs.reduce((a, b) => a + b, 0) / m.valeurs.length).toFixed(1)),
        objectif: 14, // Seuil cible
      }))

    // ── 6. Classes dénombrées ──────────────────────────────────────
    const classesUniques = [...new Set(notesRaw.map(n => n.etudiant.classe?.nom).filter(Boolean))]

    // ── 7. Récap de séance (major + participation) ─────────────────
    const majorNote = valeurs.length > 0 ? Math.max(...valeurs) : 0
    const majorNoteObj = notesRaw.find(n => n.valeur === majorNote)

    return NextResponse.json({
      // Métriques principales
      totalNotes,
      moyenneGenerale,
      tauxValidation,
      mentionsExcellence,
      nbClasses: classesUniques.length,
      tauxReussite: totalNotes > 0
        ? parseFloat(((valeurs.filter(v => v >= 10).length / totalNotes) * 100).toFixed(1))
        : 0,

      // Graphiques
      evolutionData,
      distributionData,
      classeData,
      radarData,

      // Récap
      major: {
        valeur: majorNote,
        matricule: majorNoteObj?.etudiant?.matricule || '---',
        matiere: majorNoteObj?.matiere?.intitule || '---',
      }
    })

  } catch (error) {
    console.error('Stats enseignant error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
