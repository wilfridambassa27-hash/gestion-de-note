const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Création de la vue SQL vue_bulletin_provisoire...');
  
  try {
    await prisma.$executeRawUnsafe(`
      DROP VIEW IF EXISTS vue_bulletin_provisoire;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE VIEW vue_bulletin_provisoire AS
      SELECT 
          e.id as etudiant_id,
          e.matricule,
          u.nom || ' ' || u.prenom as nom_prenom,
          c.filiere as nom_filiere,
          m.intitule as matiere,
          m.credits as coefficient,
          n.valeur as valeur_note,
          (n.valeur * m.credits) as points_obtenus,
          s.libelle as nom_semestre,
          s.id as semestre_id
      FROM "Etudiant" e
      JOIN "Note" n ON e.id = n."etudiantId"
      JOIN "Matiere" m ON n."matiereId" = m.id
      JOIN "Classe" c ON e."classeId" = c.id
      JOIN "Semestre" s ON n."semestreId" = s.id
      JOIN "User" u ON e."userId" = u.id;
    `);

    console.log('✅ Vue vue_bulletin_provisoire créée avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors de la création de la vue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
