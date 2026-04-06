const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const classes = await prisma.classe.findMany({
    where: { actif: true },
    select: { id: true, nom: true, niveau: true, filiere: true, anneeacademique: true, effectif: true },
    orderBy: { nom: 'asc' }
  });

  const etudiants = await prisma.etudiant.findMany({
    select: { id: true, matricule: true, classeId: true, user: { select: { nom: true, prenom: true, email: true } } }
  });

  let output = '=== CLASSES EXISTANTES ===\n';
  classes.forEach(c => {
    output += `ID: ${c.id} | Nom: ${c.nom} | Filière: ${c.filiere || '-'} | Effectif: ${c.effectif}\n`;
  });
  output += `\nTotal classes: ${classes.length}\n`;
  output += `\n=== ÉTUDIANTS EXISTANTS ===\n`;
  etudiants.forEach(e => {
    output += `ID: ${e.id} | Mat: ${e.matricule} | Classe: ${e.classeId || 'AUCUNE'} | ${e.user.nom} ${e.user.prenom}\n`;
  });
  output += `\nTotal étudiants: ${etudiants.length}\n`;

  fs.writeFileSync('tmp/db-state.txt', output);
  console.log('Done. Output written to tmp/db-state.txt');
}
main().catch(console.error).finally(() => prisma.$disconnect());
