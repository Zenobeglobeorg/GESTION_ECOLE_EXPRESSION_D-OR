import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient pour éviter les problèmes de pool de connexions
let prisma = null;

export const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Gérer la déconnexion proprement
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
  }

  return prisma;
};

// Export par défaut pour faciliter l'importation
export default getPrisma();

