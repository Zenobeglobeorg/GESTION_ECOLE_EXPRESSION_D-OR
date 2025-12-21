import React, { createContext, useContext, useEffect, useState } from 'react';
import * as profileService from '../services/profileService';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);

  // Charger le thème depuis le backend ou localStorage
  useEffect(() => {
    const loadTheme = async () => {
      // Vérifier si l'utilisateur est authentifié
      const token = localStorage.getItem('token');
      if (!token) {
        // Pas de token, utiliser localStorage ou valeur par défaut
        const savedTheme = localStorage.getItem('theme');
        const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
        setThemeState(initialTheme);
        applyTheme(initialTheme);
        setLoading(false);
        return;
      }

      try {
        // Essayer de charger depuis le backend
        const profile = await profileService.getCurrentUser();
        if (profile.theme && (profile.theme === 'light' || profile.theme === 'dark')) {
          setThemeState(profile.theme);
          applyTheme(profile.theme);
          localStorage.setItem('theme', profile.theme);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Si erreur (non connecté, etc.), utiliser localStorage
        console.warn('Impossible de charger le thème depuis le backend:', err);
      }

      // Fallback sur localStorage
      const savedTheme = localStorage.getItem('theme');
      const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
      setThemeState(initialTheme);
      applyTheme(initialTheme);
      setLoading(false);
    };

    loadTheme();
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    // Sauvegarder dans le backend si l'utilisateur est connecté
    try {
      await profileService.updatePreferences({ theme: newTheme });
    } catch (err) {
      // Si erreur, on garde quand même le thème en localStorage
      console.warn('Impossible de sauvegarder le thème dans le backend:', err);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
