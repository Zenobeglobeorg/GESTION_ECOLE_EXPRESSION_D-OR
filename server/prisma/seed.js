import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Créer ou mettre à jour le Super-Admin
  const superAdminPassword = await bcrypt.hash('Zenobeglobe2025', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'ZENOBEGLOBE' },
    update: { passwordHash: superAdminPassword },
    create: {
      email: 'ZENOBEGLOBE',
      passwordHash: superAdminPassword,
      firstName: 'Super',
      lastName: 'Administrateur',
      role: 'SUPER_ADMIN'
    }
  });
  console.log('✅ Super-admin créé/mis à jour');

  // Créer un compte Administrateur de test
  const adminPassword = await bcrypt.hash('Administrateur@2025', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'ADMINISTRATEUR' },
    update: { passwordHash: adminPassword },
    create: {
      email: 'ADMINISTRATEUR',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Test',
      phone: '+241 01 23 45 67',
      role: 'ADMINISTRATION'
    }
  });
  console.log('✅ Administrateur de test créé');

  // Créer un compte Enseignant de test
  const teacherPassword = await bcrypt.hash('Enseignant@2025', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'ENSEIGNANT' },
    update: { passwordHash: teacherPassword },
    create: {
      email: 'ENSEIGNANT',
      passwordHash: teacherPassword,
      firstName: 'Enseignant',
      lastName: 'Test',
      phone: '+241 02 34 56 78',
      role: 'TEACHER'
    }
  });
  console.log('✅ Enseignant de test créé');

  // Créer un compte Parent de test
  const parentPassword = await bcrypt.hash('Parent@2025', 10);
  const parent = await prisma.user.upsert({
    where: { email: 'PARENT' },
    update: { passwordHash: parentPassword },
    create: {
      email: 'PARENT',
      passwordHash: parentPassword,
      firstName: 'Parent',
      lastName: 'Test',
      phone: '+241 03 45 67 89',
      role: 'PARENT'
    }
  });
  console.log('✅ Parent de test créé');

  console.log('✅ Seeding terminé avec succès!');
  console.log('\n📝 Comptes de test créés:');
  console.log('  Super-Admin: ZENOBEGLOBE / Zenobeglobe2025');
  console.log('  Admin: ADMINISTRATEUR / Administrateur@2025');
  console.log('  Enseignant: ENSEIGNANT / Enseignant@2025');
  console.log('  Parent: PARENT / Parent@2025');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


