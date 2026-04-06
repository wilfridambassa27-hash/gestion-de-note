import prisma from './prisma';

/**
 * Vérifie si toutes les notes d'un étudiant pour un semestre donné sont saisies.
 * Si c'est le cas, met à jour le bulletin et notifie l'étudiant.
 */
export async function verifierEtNotifierReleve(etudiantId: string, semestreId: string) {
  try {
    // 1. Récupérer la classe de l'étudiant
    const etudiant = await prisma.etudiant.findUnique({
      where: { id: etudiantId },
      select: { classeId: true, userId: true }
    });

    if (!etudiant || !etudiant.classeId) return false;

    // 2. Compter le nombre de matières prévues pour cette classe au semestre actuel
    // On utilise ClasseMatiere pour définir le programme
    const totalMatieres = await prisma.classeMatiere.count({
      where: { 
        classeId: etudiant.classeId,
        // On suppose que semestreId correspond au libelle ou ID utilisé dans ClasseMatiere
        // Si ClasseMatiere utilise le libelle (ex: 'Semestre 1'), on le récupère
      }
    });

    // Note: Dans notre schema, ClasseMatiere.semestre est une String. 
    // On doit peut-être faire une jointure ou récupération préalable.
    const semestre = await prisma.semestre.findUnique({
      where: { id: semestreId },
      select: { libelle: true }
    });

    if (!semestre) return false;

    const matieresDuProgramme = await prisma.classeMatiere.count({
      where: { 
        classeId: etudiant.classeId,
        semestre: semestre.libelle // On compare avec le libelle (Semestre 1, etc.)
      }
    });

    if (matieresDuProgramme === 0) return false;

    // 3. Compter le nombre de matières ayant au moins une note pour cet étudiant ce semestre
    const notesSaisies = await prisma.note.findMany({
      where: {
        etudiantId,
        semestreId
      },
      select: {
        matiereId: true
      },
      distinct: ['matiereId']
    });

    const nbMatieresSaisies = notesSaisies.length;

    console.log(`📊 Rétrographie [${etudiantId}]: ${nbMatieresSaisies}/${matieresDuProgramme} matières.`);

    // 4. Si le compte est bon, on "scelle" le bulletin
    if (nbMatieresSaisies >= matieresDuProgramme) {
      await prisma.bulletin.upsert({
        where: {
          etudiantId_semestreId: {
            etudiantId,
            semestreId
          }
        },
        update: {
          statut: 'DISPONIBLE',
          dategeneration: new Date()
        },
        create: {
          etudiantId,
          semestreId,
          statut: 'DISPONIBLE',
          dategeneration: new Date()
        }
      });

      // 5. Notifier l'étudiant
      await prisma.notification.create({
        data: {
          userId: etudiant.userId,
          title: "🎓 Relevé de notes disponible !",
          message: "Toutes vos notes ont été certifiées. Votre relevé provisoire est désormais consultable sur votre portail.",
          type: "SUCCESS"
        }
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Erreur Rétrographie:', error);
    return false;
  }
}
