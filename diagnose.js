const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const semestres = await prisma.semestre.findMany({ select: { id: true, anneeacademique: true, actif: true } });
    console.log('--- SEMESTRES ---');
    console.log(semestres);

    const classes = await prisma.classe.findMany({ take: 5, select: { id: true, nom: true, anneeacademique: true } });
    console.log('--- CLASSES ---');
    console.log(classes);

    const teachers = await prisma.enseignant.findMany({ take: 5, include: { user: { select: { nom: true, email: true } } } });
    console.log('--- TEACHERS ---');
    console.log(teachers.map(t => ({ id: t.id, userId: t.userId, name: t.user.nom })));

    const notes = await prisma.note.findMany({ take: 5 });
    console.log('--- NOTES ---');
    console.log(`Count: ${notes.length}`);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
