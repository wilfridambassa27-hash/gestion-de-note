import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  // 1. Toutes les entrées EmploiTemps existantes
  const emplois = await prisma.emploiTemps.findMany({
    include: {
      classe: { select: { id: true, nom: true, filiere: true } },
      matiere: { select: { id: true, intitule: true } },
    },
    orderBy: [{ classeId: 'asc' }, { jour: 'asc' }, { heureDebut: 'asc' }]
  })

  // 2. Toutes les classes
  const classes = await prisma.classe.findMany({
    include: {
      matieres: { include: { matiere: { select: { id: true, intitule: true } } } },
    },
    orderBy: { nom: 'asc' }
  })

  // 3. Toutes les matières
  const matieres = await prisma.matiere.findMany({ orderBy: { intitule: 'asc' } })

  const lines: string[] = []
  lines.push(`=== EMPLOITEMPS: ${emplois.length} entrées ===\n`)
  
  // Grouper par classe
  const byClasse: Record<string, typeof emplois> = {}
  for (const e of emplois) {
    const key = e.classe.nom
    if (!byClasse[key]) byClasse[key] = []
    byClasse[key].push(e)
  }

  for (const [nom, entries] of Object.entries(byClasse)) {
    lines.push(`\n--- ${nom} (${entries.length} créneaux) ---`)
    for (const e of entries) {
      lines.push(`  ${e.jour} ${e.heureDebut}-${e.heureFin} | salle="${e.salle || 'VIDE'}" | matière="${e.matiere.intitule}"`)
    }
  }

  // Classes SANS emploi du temps
  lines.push(`\n\n=== CLASSES: ${classes.length} totales ===`)
  const classesAvecEmploi = new Set(emplois.map(e => e.classeId))
  const classesSansEmploi = classes.filter(c => !classesAvecEmploi.has(c.id))
  
  lines.push(`Classes AVEC EmploiTemps: ${classesAvecEmploi.size}`)
  lines.push(`Classes SANS EmploiTemps: ${classesSansEmploi.length}`)
  
  for (const c of classesSansEmploi) {
    lines.push(`  ❌ ${c.nom} (${c.matieres.length} matières liées) | id=${c.id}`)
    c.matieres.forEach(m => lines.push(`      - ${m.matiere.intitule}`))
  }

  lines.push(`\n\n=== MATIÈRES: ${matieres.length} totales ===`)

  fs.writeFileSync('tmp/emploi-audit.txt', lines.join('\n'), 'utf8')
  console.log(`Done: ${emplois.length} emplois, ${classes.length} classes, ${matieres.length} matieres`)
  await prisma.$disconnect()
}

main().catch(console.error)
