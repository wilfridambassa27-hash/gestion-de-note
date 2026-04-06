const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  {
    email: 'wilfridambassa27@gmail.com',
    password: '12345678',
    nom: 'Ambassa',
    prenom: 'Wilfrid',
    role: 'ENSEIGNANT',
    profile: 'enseignant',
    specialite: 'Informatique'
  },
  {
    email: 'jamskouam27@gmail.com',
    password: '12345678',
    nom: 'Kouam',
    prenom: 'Jams',
    role: 'ETUDIANT',
    profile: 'etudiant',
    classeId: 'n2-gli' // First class from seed
  },
  {
    email: 'marietina27@gmail.com',
    password: '12345678',
    nom: 'Marietina',
    prenom: '',
    role: 'PARENT',
    profile: 'parent'
  }
];

async function createBulkUsers() {
  for (const u of users) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (existing) {
        console.log(`⏭️  ${u.email} exists (actif: ${existing.actif})`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 12);

      const user = await prisma.user.create({
        data: {
          email: u.email,
          password: hashedPassword,
          nom: u.nom,
          prenom: u.prenom,
          role: u.role,
          telephone: '+22812345678',
          actif: true,
        }
      });

      // Create profile
      if (u.profile === 'enseignant') {
        await prisma.enseignant.create({
          data: {
            userId: user.id,
            matricule: `ENS${user.id.slice(-4)}`,
            specialite: u.specialite
          }
        });
      } else if (u.profile === 'etudiant') {
        await prisma.etudiant.create({
          data: {
            userId: user.id,
            matricule: `E${user.id.slice(-3)}`,
            classeId: u.classeId
          }
        });
      } else if (u.profile === 'parent') {
        await prisma.parent.create({
          data: {
            userId: user.id,
            etudiantId: 'etu-1' // Link to first student
          }
        });
      }

      console.log(`✅ ${u.email} créé (${u.role})`);
    } catch (error) {
      console.error(`❌ Error ${u.email}:`, error.message);
    }
  }
  console.log('\n** Bulk creation complete! Test login now **');
  await prisma.$disconnect();
}

createBulkUsers();

