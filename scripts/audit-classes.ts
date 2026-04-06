import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const classes = await prisma.classe.findMany({
    include: {
      matieres: { include: { matiere: true } },
      etudiants: { select: { matricule: true } },
    },
    orderBy: { nom: 'asc' }
  })

  const lines: string[] = [`Total: ${classes.length} classes\n`]
  
  // Grouper par (nom + filière) -> multiples entrées avec même nom
  // Format: "Médecine A" -> plusieurs classes avec ce nom exact
  const byExactName: Record<string, typeof classes> = {}
  for (const cls of classes) {
    const key = `${cls.nom}__${cls.filiere}`
    if (!byExactName[key]) byExactName[key] = []
    byExactName[key].push(cls)
  }

  let toDelete: string[] = []
  let toKeep: string[] = []

  for (const [key, grp] of Object.entries(byExactName)) {
    const [nom, filiere] = key.split('__')
    lines.push(`\n=== "${nom}" (${grp.length} entrées) ===`)
    
    // Trier: mettre en premier celles qui ont des matières
    const sorted = grp.sort((a, b) => b.matieres.length - a.matieres.length)
    
    // Garder la première (celle avec le plus de matières)
    const keepOne = sorted[0]
    const deleteOthers = sorted.slice(1)
    
    lines.push(`  GARDER: ${keepOne.id} | matieres=${keepOne.matieres.length} | etudiants=${keepOne.etudiants.length}`)
    keepOne.matieres.forEach(m => lines.push(`    matiere: ${m.matiere.intitule} | sem=${m.semestre}`))
    
    for (const cls of deleteOthers) {
      lines.push(`  SUPPRIMER: ${cls.id} | matieres=${cls.matieres.length} | etudiants=${cls.etudiants.length}`)
      cls.matieres.forEach(m => lines.push(`    matiere: ${m.matiere.intitule} | sem=${m.semestre}`))
      toDelete.push(cls.id)
    }
    
    toKeep.push(keepOne.id)
  }

  lines.push(`\n\n=== RÉSUMÉ ===`)
  lines.push(`Classes à GARDER: ${toKeep.length}`)
  lines.push(`Classes à SUPPRIMER: ${toDelete.length}`)
  lines.push(`IDs à supprimer: ${JSON.stringify(toDelete)}`)

  const content = lines.join('\n')
  fs.writeFileSync('tmp/dedup-report.txt', content, 'utf8')
  fs.writeFileSync('tmp/ids-to-delete.json', JSON.stringify(toDelete, null, 2), 'utf8')

  console.log(`Done. A garder: ${toKeep.length}, A supprimer: ${toDelete.length}`)
  await prisma.$disconnect()
}

main().catch(console.error)
