const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const cmat = await prisma.classeMatiere.findMany({ take: 5 });
  console.log("ClasseMatiere mappings:", cmat.length);

  const mat = await prisma.matiere.findMany({ take: 5 });
  console.log("Matieres total:", mat.length);

  const classes = await prisma.classe.findMany({ take: 5 });
  console.log("Classes total:", classes.length);
}

checkData();
