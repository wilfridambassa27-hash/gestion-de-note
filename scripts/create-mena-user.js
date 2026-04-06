const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  const email = 'menahmichelle27@gmail.com';
  const password = '12345678';
  const nom = 'Mena';
  const prenom = 'Michelle';
  const role = 'ADMIN';

  try {
    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`❌ User exists: actif=${existing.actif}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        role,
        telephone: '+22812345678',
        actif: true,
      }
    });

    // Create admin profile
    await prisma.administrateur.create({
      data: {
        userId: user.id,
        niveauprivilege: 'ADMIN'
      }
    });

    console.log('✅ User created!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('Login now!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();

