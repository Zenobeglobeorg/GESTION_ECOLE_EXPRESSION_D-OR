import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Créer ou mettre à jour le Super-Admin
  const superAdminPassword = await bcrypt.hash('Expressiondor@2025', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'aurelieboubata37@gmail.com' },
    update: { passwordHash: superAdminPassword },
    create: {
      email: 'aurelieboubata37@gmail.com',
      passwordHash: superAdminPassword,
      firstName: 'BOUBATA Aurelie',
      lastName: 'Therese',
      role: 'SUPER_ADMIN',
      function: 'Fondatrice',
      phone: '+241 077 902 025',
    },
  });
  console.log('✅ Super-admin créé/mis à jour');




  console.log('✅ Seeding terminé avec succès!');
  console.log('\n📝 Comptes de test créés:');
  console.log('  Super-Admin: aurelieboubata37@gmail.com / Expressiondor@2025');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


