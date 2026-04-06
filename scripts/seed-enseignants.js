const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const enseignantsData = [
  { matricule: 'EDUNOTES-2026-001', nom: 'MBARGA', prenom: 'Jean-Pierre', telephone: '699112233' },
  { matricule: 'EDUNOTES-2026-002', nom: 'FOTSO', prenom: 'Emilie', telephone: '677889900' },
  { matricule: 'EDUNOTES-2026-003', nom: 'TCHEUWA', prenom: 'Christian', telephone: '655443322' },
  { matricule: 'EDUNOTES-2026-004', nom: 'KAMGA', prenom: 'Sandrine', telephone: '690123456' },
  { matricule: 'EDUNOTES-2026-005', nom: 'NGO', prenom: 'Alice', telephone: '678901234' },
];

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  INSERTION DES 5 ENSEIGNANTS — EduNotes v4.0    ║');
  console.log('╚══════════════════════════════════════════════════╝\\n');

  const defaultPassword = await bcrypt.hash('Edunotes2026!', 10);
  let inserted = 0;

  for (const prof of enseignantsData) {
    try {
      // Generate email like e.fotso@edunotes.ac
      const emailFirstChar = prof.prenom.charAt(0).toLowerCase();
      const emailLastName = prof.nom.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${emailFirstChar}.${emailLastName}@edunotes.ac`;

      // Check user
      const existingUser = await prisma.user.findUnique({ where: { email } });
      const existingEns = await prisma.enseignant.findUnique({ where: { matricule: prof.matricule } });

      if (existingUser || existingEns) {
        console.log(`⏭️ SKIP ${prof.matricule} (${email}) — Déjà en base de données.`);
        continue;
      }

      await prisma.user.create({
        data: {
          email: email,
          password: defaultPassword,
          nom: prof.nom,
          prenom: prof.prenom,
          telephone: prof.telephone,
          role: 'ENSEIGNANT',
          actif: true,
          enseignant: {
            create: {
              matricule: prof.matricule,
              specialite: 'Général',
              dateembauche: new Date(),
              grade: 'Professeur',
            }
          }
        }
      });

      console.log(`✅ SUCCESS: Inséré ${prof.matricule} - ${prof.nom} ${prof.prenom} (${email})`);
      inserted++;
    } catch (err) {
      console.error(`❌ Erreur sur ${prof.matricule}: ${err.message}`);
    }
  }

  console.log(`\\n🎉 Terminé ! ${inserted} nouveaux enseignants ont été ajoutés.`);
}

main()
  .catch(err => { console.error('ERREUR:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
