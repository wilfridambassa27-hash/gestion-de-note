const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRetrographie() {
  console.log('🧪 Test du système de Rétrographie...');

  try {
    // 1. Trouver un étudiant test
    const etudiant = await prisma.etudiant.findFirst({
      include: {
        classe: {
          include: {
            matieres: true
          }
        }
      }
    });

    if (!etudiant) {
      console.log('❌ Aucun étudiant trouvé.');
      return;
    }

    const semestre = await prisma.semestre.findFirst({ where: { actif: true } }) 
                  || await prisma.semestre.findFirst({ orderBy: { datedebut: 'desc' } });

    if (!semestre) {
      console.log('❌ Aucun semestre trouvé.');
      return;
    }

    console.log(`👨‍🎓 Étudiant: ${etudiant.matricule} - Classe: ${etudiant.classe.nom}`);
    const matieresClasse = etudiant.classe.matieres.filter(m => m.semestre === semestre.libelle);
    console.log(`📚 Matières requises pour ${semestre.libelle}: ${matieresClasse.length}`);

    if (matieresClasse.length === 0) {
      console.log('⚠️ Aucune matière définie pour ce semestre dans cette classe.');
      return;
    }

    // 2. Vérifier l'état actuel
    const notesActuelles = await prisma.note.findMany({
      where: { etudiantId: etudiant.id, semestreId: semestre.id },
      distinct: ['matiereId']
    });
    console.log(`📝 Notes déjà saisies: ${notesActuelles.length}/${matieresClasse.length}`);

    // Import direct de la fonction verifierEtNotifierReleve n'est pas facile en JS pur depuis src/lib/
    // Mais on peut simuler l'appel API ou recréer la logique ici pour le test de cohérence BD.
    
    // On va juste vérifier si la vue SQL fonctionne
    const vueData = await prisma.$queryRawUnsafe(`
      SELECT * FROM vue_bulletin_provisoire WHERE etudiant_id = $1 AND semestre_id = $2;
    `, etudiant.id, semestre.id);

    console.log('🖼️ Données de la vue SQL:', vueData.length, 'lignes trouvées.');

  } catch (error) {
    console.error('❌ Erreur de test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRetrographie();
