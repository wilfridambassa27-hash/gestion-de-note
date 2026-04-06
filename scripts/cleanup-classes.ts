/**
 * cleanup-classes.ts
 * 
 * Ce script :
 * 1. Pour chaque filière, garde 1 seule classe A et 1 seule classe B
 *    (en priorité celles qui ont des matières ou des étudiants)
 * 2. Migre les étudiants des classes à supprimer vers celles à garder
 * 3. Supprime les classes en double/triple redondantes
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n========== NETTOYAGE DES CLASSES DUPLIQUÉES ==========\n')

  const classes = await prisma.classe.findMany({
    include: {
      matieres: true,
      etudiants: { select: { id: true, matricule: true } },
      emplois: true,
    },
    orderBy: { nom: 'asc' }
  })

  console.log(`Classes avant nettoyage: ${classes.length}`)

  // Grouper par (nom exact + filière)
  const byExactName: Record<string, typeof classes> = {}
  for (const cls of classes) {
    const key = `${cls.nom}|||${cls.filiere}`
    if (!byExactName[key]) byExactName[key] = []
    byExactName[key].push(cls)
  }

  let totalDeleted = 0
  let totalStudentsMigrated = 0

  for (const [key, grp] of Object.entries(byExactName)) {
    const [nom] = key.split('|||')

    if (grp.length <= 1) {
      // Pas de doublon, rien à faire
      continue
    }

    // Trier : priorité aux classes avec étudiants, puis avec matières
    const sorted = grp.sort((a, b) => {
      const aScore = a.etudiants.length * 100 + a.matieres.length
      const bScore = b.etudiants.length * 100 + b.matieres.length
      return bScore - aScore
    })

    const keepClass = sorted[0]
    const toDeleteClasses = sorted.slice(1)

    console.log(`\n📌 "${nom}" - Garder: ${keepClass.id} (${keepClass.etudiants.length} étud, ${keepClass.matieres.length} matières)`)

    for (const delCls of toDeleteClasses) {
      console.log(`  🗑️  Supprimer: ${delCls.id} (${delCls.etudiants.length} étud, ${delCls.matieres.length} matières)`)

      // 1. Migrer les étudiants vers la classe gardée
      if (delCls.etudiants.length > 0) {
        for (const etudiant of delCls.etudiants) {
          await prisma.etudiant.update({
            where: { id: etudiant.id },
            data: { classeId: keepClass.id }
          })
          console.log(`     ✅ Étudiant ${etudiant.matricule} migré vers ${keepClass.id}`)
          totalStudentsMigrated++
        }
      }

      // 2. Supprimer les entrées EmploiTemps (dépendance)
      if (delCls.emplois.length > 0) {
        await prisma.emploiTemps.deleteMany({ where: { classeId: delCls.id } })
        console.log(`     🗑️  ${delCls.emplois.length} emploiTemps supprimés`)
      }

      // 3. Supprimer les ClasseMatiere (dépendances en cascade normalement)
      await prisma.classeMatiere.deleteMany({ where: { classeId: delCls.id } })

      // 4. Supprimer la classe
      await prisma.classe.delete({ where: { id: delCls.id } })
      totalDeleted++
      console.log(`     ✅ Classe ${delCls.id} supprimée`)
    }
  }

  // Vérification finale
  const remaining = await prisma.classe.findMany({
    select: { id: true, nom: true, filiere: true },
    orderBy: { nom: 'asc' }
  })

  console.log(`\n========== RÉSULTAT FINAL ==========`)
  console.log(`Classes avant: ${classes.length}`)
  console.log(`Classes supprimées: ${totalDeleted}`)
  console.log(`Classes restantes: ${remaining.length}`)
  console.log(`Étudiants migrés: ${totalStudentsMigrated}`)
  console.log(`\nClasses conservées:`)
  remaining.forEach(c => console.log(`  ✅ ${c.nom} (${c.filiere}) - ID: ${c.id}`))

  await prisma.$disconnect()
}

main().catch(e => {
  console.error('ERREUR:', e)
  process.exit(1)
})
