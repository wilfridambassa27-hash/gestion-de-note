const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const etudiant = await prisma.etudiant.findFirst();
    const matiere = await prisma.matiere.findFirst();
    const semestre = await prisma.semestre.findFirst();

    if (!etudiant || !matiere || !semestre) {
        console.log("Missing DB data for test.");
        return;
    }

    const type_evaluation = "DS";
    const coefficient = 1;

    console.log("Upserting evaluation...");
    const evaluation = await prisma.evaluation.upsert({
      where: {
        matiereId_semestreId_type: {
          matiereId: matiere.id,
          semestreId: semestre.id,
          type: type_evaluation
        }
      },
      update: {
        coefficient: Number(coefficient)
      },
      create: {
        matiereId: matiere.id,
        semestreId: semestre.id,
        type: type_evaluation,
        coefficient: Number(coefficient),
        date: new Date()
      }
    });
    console.log("Eval:", evaluation.id);

    console.log("Upserting note...");
    const savedNote = await prisma.note.upsert({
      where: {
        etudiantId_evaluationId: {
          etudiantId: etudiant.id,
          evaluationId: evaluation.id
        }
      },
      update: {
        valeur: 15,
        datenote: new Date()
      },
      create: {
        etudiantId: etudiant.id,
        evaluationId: evaluation.id,
        matiereId: matiere.id,
        semestreId: semestre.id,
        valeur: 15,
        datenote: new Date(),
      }
    });
    console.log("Note:", savedNote.id);
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  }
}

test().finally(() => window.process?.exit(0) || process.exit(0));
