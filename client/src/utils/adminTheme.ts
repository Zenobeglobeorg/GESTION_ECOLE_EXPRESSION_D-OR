import type { AdminThemeColor, AdminThemeColors } from '../contexts/AdminThemeContext';

/**
 * Retourne les classes CSS complètes selon le thème de couleurs
 */
export const getAdminThemeClasses = (themeColor: AdminThemeColor) => {
  const themes: Record<AdminThemeColor, {
    bgGradient: string;
    titleColor: string;
    subtitleColor: string;
    badgeGradient: string;
    badgeText: string;
    btnPrimary: string;
    btnSecondary: string;
    btnOutline: string;
    cardBorder: string;
    textPrimary: string;
    textPrimaryLight: string;
  }> = {
    'blue-yellow': {
      bgGradient: 'bg-linear-to-br from-blue-50 via-white to-yellow-50',
      titleColor: 'text-blue-900',
      subtitleColor: 'text-blue-700',
      badgeGradient: 'bg-linear-to-br from-yellow-400 to-yellow-500',
      badgeText: 'text-blue-900',
      btnPrimary: 'bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500',
      btnSecondary: 'bg-blue-600 text-white hover:bg-blue-700',
      btnOutline: 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400',
      cardBorder: 'border-blue-100',
      textPrimary: 'text-blue-900',
      textPrimaryLight: 'text-blue-700',
    },
    'green-teal': {
      bgGradient: 'bg-linear-to-br from-green-50 via-white to-teal-50',
      titleColor: 'text-green-900',
      subtitleColor: 'text-green-700',
      badgeGradient: 'bg-linear-to-br from-teal-400 to-teal-500',
      badgeText: 'text-green-900',
      btnPrimary: 'bg-linear-to-r from-teal-400 via-teal-500 to-teal-400 text-green-900 hover:from-teal-500 hover:to-teal-500',
      btnSecondary: 'bg-green-600 text-white hover:bg-green-700',
      btnOutline: 'border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400',
      cardBorder: 'border-green-100',
      textPrimary: 'text-green-900',
      textPrimaryLight: 'text-green-700',
    },
    'purple-pink': {
      bgGradient: 'bg-linear-to-br from-purple-50 via-white to-pink-50',
      titleColor: 'text-purple-900',
      subtitleColor: 'text-purple-700',
      badgeGradient: 'bg-linear-to-br from-pink-400 to-pink-500',
      badgeText: 'text-purple-900',
      btnPrimary: 'bg-linear-to-r from-pink-400 via-pink-500 to-pink-400 text-purple-900 hover:from-pink-500 hover:to-pink-500',
      btnSecondary: 'bg-purple-600 text-white hover:bg-purple-700',
      btnOutline: 'border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400',
      cardBorder: 'border-purple-100',
      textPrimary: 'text-purple-900',
      textPrimaryLight: 'text-purple-700',
    },
    'orange-red': {
      bgGradient: 'bg-linear-to-br from-orange-50 via-white to-red-50',
      titleColor: 'text-orange-900',
      subtitleColor: 'text-orange-700',
      badgeGradient: 'bg-linear-to-br from-red-400 to-red-500',
      badgeText: 'text-orange-900',
      btnPrimary: 'bg-linear-to-r from-red-400 via-red-500 to-red-400 text-orange-900 hover:from-red-500 hover:to-red-500',
      btnSecondary: 'bg-orange-600 text-white hover:bg-orange-700',
      btnOutline: 'border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400',
      cardBorder: 'border-orange-100',
      textPrimary: 'text-orange-900',
      textPrimaryLight: 'text-orange-700',
    },
    'indigo-blue': {
      bgGradient: 'bg-linear-to-br from-indigo-50 via-white to-blue-50',
      titleColor: 'text-indigo-900',
      subtitleColor: 'text-indigo-700',
      badgeGradient: 'bg-linear-to-br from-blue-400 to-blue-500',
      badgeText: 'text-indigo-900',
      btnPrimary: 'bg-linear-to-r from-blue-400 via-blue-500 to-blue-400 text-indigo-900 hover:from-blue-500 hover:to-blue-500',
      btnSecondary: 'bg-indigo-600 text-white hover:bg-indigo-700',
      btnOutline: 'border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400',
      cardBorder: 'border-indigo-100',
      textPrimary: 'text-indigo-900',
      textPrimaryLight: 'text-indigo-700',
    },
  };

  return themes[themeColor];
};
