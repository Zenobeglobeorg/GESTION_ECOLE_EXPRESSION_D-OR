import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types pour les rôles utilisateurs
export type UserRole = 'SUPER_ADMIN' | 'ADMINISTRATION' | 'TEACHER' | 'PARENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
      const { user, token } = await loginService({ email, password });
      
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

  const logout = async () => {
    const { logout: logoutService } = await import('../services/authService');
    await logoutService();
    setUser(null);
  };

  // Récupérer l'utilisateur depuis l'API au chargement
  useEffect(() => {
    const loadUser = async () => {
      const { getCurrentUser } = await import('../services/authService');
      const user = await getCurrentUser();
      if (user) {
        setUser(user);
      }
    };
    loadUser();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

