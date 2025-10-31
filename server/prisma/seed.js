import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Vérifier si le super-admin existe déjà
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: 'ZENOBEGLOBE' }
  });

  if (existingSuperAdmin) {
    console.log('⚠️  Le super-admin existe déjà. Mise à jour du mot de passe...');
    
    // Mettre à jour le mot de passe
    const passwordHash = await bcrypt.hash('Zenobeglobe2025', 10);
    await prisma.user.update({
      where: { email: 'ZENOBEGLOBE' },
      data: { passwordHash }
    });
    
    console.log('✅ Mot de passe du super-admin mis à jour');
  } else {
    // Créer le super-admin
    const passwordHash = await bcrypt.hash('Zenobeglobe2025', 10);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'ZENOBEGLOBE',
        passwordHash,
        firstName: 'Super',
        lastName: 'Administrateur',
        role: 'SUPER_ADMIN'
      }
    });

    console.log('✅ Super-admin créé:', superAdmin);
  }

  console.log('✅ Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


