import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const classes = await prisma.classe.findMany({
    select: { id: true, nom: true, filiere: true, niveau: true },
    orderBy: { nom: 'asc' }
  })
  
  const lines = [`Total: ${classes.length} classes\n`]
  classes.forEach(c => {
    lines.push(`"${c.nom}" | filiere="${c.filiere}" | niveau="${c.niveau}" | id=${c.id}`)
  })
  
  const content = lines.join('\n')
  fs.writeFileSync('tmp/classes-raw.txt', content, 'utf8')
  console.log(`Saved ${classes.length} classes to tmp/classes-raw.txt`)
  
  await prisma.$disconnect()
}

main().catch(console.error)
