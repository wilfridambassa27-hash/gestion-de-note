const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'menahmichelle27@gmail.com' }
    });
    if (user) {
      console.log(`✅ User FOUND:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Actif: ${user.actif}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password hash starts: ${user.password?.slice(0, 10)}...`);
    } else {
      console.log('❌ User NOT FOUND in DB');
    }
    // List all emails
    const allUsers = await prisma.user.findMany({ select: { email: true, actif: true } });
    console.log('\nAll users:');
    allUsers.forEach(u => console.log(`  ${u.email} (actif: ${u.actif})`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

