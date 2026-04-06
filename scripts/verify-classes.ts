import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const remaining = await prisma.classe.findMany({
    include: {
      matieres: true,
      etudiants: { select: { matricule: true } }
    },
    orderBy: { nom: 'asc' }
  })

  const lines: string[] = [`Total restant: ${remaining.length} classes\n`]
  remaining.forEach(c => {
    lines.push(`"${c.nom}" | ${c.matieres.length} matières | ${c.etudiants.length} étudiants | id=${c.id}`)
  })

  fs.writeFileSync('tmp/final-classes.txt', lines.join('\n'), 'utf8')
  console.log(`Done: ${remaining.length} classes restantes`)
  await prisma.$disconnect()
}

main().catch(console.error)
