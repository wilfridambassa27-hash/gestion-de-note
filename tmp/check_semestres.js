
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSemesters() {
  const semestres = await prisma.semestre.findMany();
  console.log('Semestres:', JSON.stringify(semestres, null, 2));
  process.exit(0);
}

checkSemesters();
