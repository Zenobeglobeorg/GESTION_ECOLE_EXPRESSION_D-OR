/**
 * Utilitaires pour la gestion des paiements
 */

/**
 * Obtient la date limite de paiement (5 mars de l'année en cours)
 * Si on est déjà après le 5 mars, retourne le 5 mars de l'année suivante
 * @returns {Date} Date limite de paiement
 */
export const getFinalPaymentDueDate = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const finalDate = new Date(currentYear, 2, 5); // 5 mars (mois 2 = mars, 0-indexed)
  
  // Si on est déjà après le 5 mars de cette année, utiliser l'année suivante
  if (today > finalDate) {
    return new Date(currentYear + 1, 2, 5);
  }
  
  return finalDate;
};

/**
 * Obtient la date limite de paiement pour une année académique spécifique
 * @param {number} academicYear - Année académique (ex: 2024 pour 2024-2025)
 * @returns {Date} Date limite de paiement (5 mars de l'année suivante)
 */
export const getFinalPaymentDueDateForAcademicYear = (academicYear) => {
  // L'année académique se termine en juin, donc la date limite est le 5 mars de l'année suivante
  return new Date(academicYear + 1, 2, 5);
};

/**
 * Récupère l'année académique active (celle utilisée par le système de notes/paliers),
 * ou en crée une si aucune n'existe encore. Permet de rattacher les paiements générés
 * à une année précise (gestion par année) au lieu de tout mélanger dans une seule table.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @returns {Promise<{id: number, name: string, startDate: Date, endDate: Date}>}
 */
export const getOrCreateActiveAcademicYear = async (prisma) => {
  let academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true },
    orderBy: { startDate: 'desc' },
  });

  if (!academicYear) {
    const currentYear = new Date().getFullYear();
    academicYear = await prisma.academicYear.create({
      data: {
        name: `${currentYear}-${currentYear + 1}`,
        startDate: new Date(currentYear, 8, 1), // 1er septembre
        endDate: new Date(currentYear + 1, 6, 30), // 30 juin
        isActive: true,
      },
    });
  }

  return academicYear;
};


