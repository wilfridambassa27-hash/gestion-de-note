const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const s2 = await prisma.semestre.create({
      data: {
        libelle: "Semestre 2",
        datedebut: new Date("2026-03-01"),
        datefin: new Date("2026-07-30"),
        anneeacademique: "2025/2026",
        actif: true, // we set it to true so the teacher can see it in the list
        cloture: false
      }
    });
    console.log("Semestre 2 ajouté avec succès:", s2);
  } catch (err) {
    console.error("Erreur:", err);
  }
}

main().finally(() => prisma.$disconnect());
