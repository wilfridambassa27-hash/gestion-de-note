import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 1. Comptages de base
    const totalEtudiants = await prisma.etudiant.count()
    const totalEnseignants = await prisma.enseignant.count()
    
    // 2. Moyenne Générale & Taux de Réussite
    const statsNotes = await prisma.note.aggregate({
      _avg: { valeur: true },
      _count: { id: true }
    })

    const notesReussies = await prisma.note.count({
      where: { valeur: { gte: 10 } }
    })

    const moyenneGenerale = statsNotes._avg.valeur || 0
    const tauxReussite = statsNotes._count.id > 0 
      ? (notesReussies / statsNotes._count.id) * 100 
      : 0

    // 3. QRCodes Actifs
    const qrActifs = await prisma.qRCode.count({
      where: { statut: 'ACTIF' }
    })

    // 4. Performance par Filière (Réussite)
    const classes = await prisma.classe.findMany({
      include: { etudiants: { include: { notes: true } } }
    })

    const filierePerformance: Record<string, { total: number, reussies: number }> = {}

    classes.forEach(cls => {
      const filiere = cls.filiere || 'Général'
      if (!filierePerformance[filiere]) {
        filierePerformance[filiere] = { total: 0, reussies: 0 }
      }
      
      cls.etudiants.forEach(etud => {
        etud.notes.forEach(note => {
          filierePerformance[filiere].total++
          if (note.valeur >= 10) filierePerformance[filiere].reussies++
        })
      })
    })

    const dataFiliere = Object.keys(filierePerformance).map(f => ({
      f,
      val: filierePerformance[f].total > 0 
        ? Math.round((filierePerformance[f].reussies / filierePerformance[f].total) * 100) 
        : 0
    })).sort((a, b) => b.val - a.val).slice(0, 5)

    // 5. Trajectoire Académique (Évolution mensuelle)
    // On simule/calcule sur les 6 derniers mois
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)

    const recentNotes = await prisma.note.findMany({
      where: { datenote: { gte: sixMonthsAgo } },
      select: { valeur: true, datenote: true }
    })

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    const history: Record<string, { sum: number, count: number }> = {}

    recentNotes.forEach(n => {
      const month = months[new Date(n.datenote).getMonth()]
      if (!history[month]) history[month] = { sum: 0, count: 0 }
      history[month].sum += n.valeur
      history[month].count++
    })

    const dataPerformance = months.map(m => ({
      name: m,
      moyenne: history[m] ? parseFloat((history[m].sum / history[m].count).toFixed(2)) : 0
    })).filter(m => m.moyenne > 0)

    // 6. Derniers Bulletins (Journal de Rétrographie)
    const logsBulletins = await prisma.bulletin.findMany({
      take: 5,
      orderBy: { dategeneration: 'desc' },
      include: { etudiant: { include: { user: true } } }
    })

    return NextResponse.json({
      kpis: {
        totalEtudiants,
        totalEnseignants,
        moyenneGenerale: moyenneGenerale.toFixed(2),
        tauxReussite: tauxReussite.toFixed(1),
        qrActifs
      },
      dataPerformance,
      dataFiliere,
      logsBulletins: logsBulletins.map(l => ({
        id: l.id,
        ref: `ISTA/${l.id.slice(-8).toUpperCase()}`,
        name: `${l.etudiant.user.nom} ${l.etudiant.user.prenom}`,
        date: l.dategeneration,
        status: 'SUCCESS'
      }))
    })
  } catch (error: any) {
    console.error('Erreur Stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
