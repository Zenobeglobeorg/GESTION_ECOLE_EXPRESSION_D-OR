/**
 * Fonctions de validation pour les formulaires
 */

/**
 * Valide un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone (format international simplifié)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Valide un mot de passe (minimum 8 caractères, au moins une majuscule et un chiffre)
 */
export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
};

/**
 * Valide une date de naissance (doit être dans le passé et l'âge doit être raisonnable)
 */
export const isValidBirthDate = (date: string): boolean => {
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  return birthDate < today && age >= 4 && age <= 18;
};

