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

