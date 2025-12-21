import React, { createContext, useContext, useEffect, useState } from 'react';
import * as profileService from '../services/profileService';

// Export du type pour compatibilité avec Vite
export type AdminThemeColor = 'blue-yellow' | 'green-teal' | 'purple-pink' | 'orange-red' | 'indigo-blue';

export interface AdminThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  text: string;
  textLight: string;
  bg: string;
  bgLight: string;
}

const themePalettes: Record<AdminThemeColor, AdminThemeColors> = {
  'blue-yellow': {
    primary: 'blue',
    primaryLight: 'blue-50',
    primaryDark: 'blue-900',
    secondary: 'yellow',
    secondaryLight: 'yellow-50',
    secondaryDark: 'yellow-600',
    accent: 'yellow-400',
    accentLight: 'yellow-100',
    text: 'blue-900',
    textLight: 'blue-700',
    bg: 'blue-50',
    bgLight: 'yellow-50',
  },
  'green-teal': {
    primary: 'green',
    primaryLight: 'green-50',
    primaryDark: 'green-900',
    secondary: 'teal',
    secondaryLight: 'teal-50',
    secondaryDark: 'teal-600',
    accent: 'teal-400',
    accentLight: 'teal-100',
    text: 'green-900',
    textLight: 'green-700',
    bg: 'green-50',
    bgLight: 'teal-50',
  },
  'purple-pink': {
    primary: 'purple',
    primaryLight: 'purple-50',
    primaryDark: 'purple-900',
    secondary: 'pink',
    secondaryLight: 'pink-50',
    secondaryDark: 'pink-600',
    accent: 'pink-400',
    accentLight: 'pink-100',
    text: 'purple-900',
    textLight: 'purple-700',
    bg: 'purple-50',
    bgLight: 'pink-50',
  },
  'orange-red': {
    primary: 'orange',
    primaryLight: 'orange-50',
    primaryDark: 'orange-900',
    secondary: 'red',
    secondaryLight: 'red-50',
    secondaryDark: 'red-600',
    accent: 'red-400',
    accentLight: 'red-100',
    text: 'orange-900',
    textLight: 'orange-700',
    bg: 'orange-50',
    bgLight: 'red-50',
  },
  'indigo-blue': {
    primary: 'indigo',
    primaryLight: 'indigo-50',
    primaryDark: 'indigo-900',
    secondary: 'blue',
    secondaryLight: 'blue-50',
    secondaryDark: 'blue-600',
    accent: 'blue-400',
    accentLight: 'blue-100',
    text: 'indigo-900',
    textLight: 'indigo-700',
    bg: 'indigo-50',
    bgLight: 'blue-50',
  },
};

interface AdminThemeContextType {
  themeColor: AdminThemeColor;
  setThemeColor: (color: AdminThemeColor) => void;
  colors: AdminThemeColors;
  loading: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColorState] = useState<AdminThemeColor>('blue-yellow');
  const [loading, setLoading] = useState(true);

  // Charger le thème de couleurs depuis le backend
  useEffect(() => {
    const loadThemeColor = async () => {
      // Vérifier si l'utilisateur est authentifié
      const token = localStorage.getItem('token');
      if (!token) {
        // Pas de token, utiliser localStorage ou valeur par défaut
        const savedTheme = localStorage.getItem('adminThemeColor');
        const initialTheme = (savedTheme && savedTheme in themePalettes) 
          ? savedTheme as AdminThemeColor 
          : 'blue-yellow';
        setThemeColorState(initialTheme);
        setLoading(false);
        return;
      }

      try {
        const profile = await profileService.getCurrentUser();
        if (profile.adminThemeColor && profile.adminThemeColor in themePalettes) {
          setThemeColorState(profile.adminThemeColor as AdminThemeColor);
          localStorage.setItem('adminThemeColor', profile.adminThemeColor);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Erreur (non authentifié, etc.), utiliser localStorage
        console.warn('Impossible de charger le thème de couleurs depuis le backend:', err);
      }

      // Fallback sur localStorage
      const savedTheme = localStorage.getItem('adminThemeColor');
      const initialTheme = (savedTheme && savedTheme in themePalettes) 
        ? savedTheme as AdminThemeColor 
        : 'blue-yellow';
      setThemeColorState(initialTheme);
      localStorage.setItem('adminThemeColor', initialTheme);
      setLoading(false);
    };

    loadThemeColor();
  }, []);

  const setThemeColor = async (newThemeColor: AdminThemeColor) => {
    setThemeColorState(newThemeColor);
    localStorage.setItem('adminThemeColor', newThemeColor);

    // Sauvegarder dans le backend
    try {
      await profileService.updatePreferences({ adminThemeColor: newThemeColor });
    } catch (err) {
      console.warn('Impossible de sauvegarder le thème de couleurs dans le backend:', err);
    }
  };

  const colors = themePalettes[themeColor];

  return (
    <AdminThemeContext.Provider value={{ themeColor, setThemeColor, colors, loading }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};

// Export aussi comme valeur pour compatibilité avec certains bundlers
export const ADMIN_THEME_COLORS: readonly AdminThemeColor[] = ['blue-yellow', 'green-teal', 'purple-pink', 'orange-red', 'indigo-blue'] as const;
