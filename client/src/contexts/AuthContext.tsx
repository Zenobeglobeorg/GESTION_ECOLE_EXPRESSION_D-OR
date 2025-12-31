/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { LoginResponse } from '../services/authService';

// Types pour les rôles utilisateurs
export type UserRole = 'SUPER_ADMIN' | 'ADMINISTRATION' | 'TEACHER' | 'PARENT';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  function?: string | null; // Fonction de l'administrateur
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void | { requiresTwoFactor: true; emailSent: boolean; devCode?: string }>;
  verifyTwoFactor: (email: string, code: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { login: loginService } = await import('../services/authService');
      const result = await loginService({ email, password });
      
      // Si la 2FA est requise, retourner un objet spécial
      if ('requiresTwoFactor' in result && result.requiresTwoFactor) {
        setIsLoading(false);
        return result;
      }
      
      // Sinon, connexion normale
      const { user, token } = result as LoginResponse;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactor = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const { verifyTwoFactor: verifyTwoFactorService } = await import('../services/authService');
      const { user, token } = await verifyTwoFactorService(email, code);
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Verify 2FA error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { logout: logoutService } = await import('../services/authService');
    await logoutService();
    setUser(null);
  };

  // Récupérer l'utilisateur depuis l'API au chargement
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }
        setIsLoading(true);
        const { getCurrentUser } = await import('../services/authService');
        const user = await getCurrentUser();
        if (user) {
          setUser(user);
        } else {
          // Si le token est invalide, nettoyer le localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // En cas d'erreur, nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    verifyTwoFactor,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

