import { User, UserRole } from '../contexts/AuthContext';

/**
 * Service d'authentification
 * 
 * Ce service contient toutes les fonctions pour communiquer avec l'API d'authentification.
 * Pour l'instant, il utilise des données mockées. Plus tard, ces fonctions appelleront
 * les vraies routes API backend.
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Authentifie un utilisateur
 * 
 * @param credentials - Email et mot de passe
 * @returns L'utilisateur authentifié et un token JWT
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // TODO: Remplacer par l'appel API réel
  // const response = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials),
  // });
  // return response.json();

  // Données mockées pour le développement
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simule une latence réseau

  const mockUser: User = {
    id: '1',
    email: credentials.email,
    firstName: 'John',
    lastName: 'Doe',
    phone: '+221 77 123 45 67',
    role: 'ADMINISTRATION' as UserRole,
  };

  return {
    user: mockUser,
    token: 'mock-jwt-token-' + Date.now(),
  };
};

/**
 * Déconnecte l'utilisateur
 */
export const logout = async (): Promise<void> => {
  // TODO: Appel API pour invalider le token
  // await fetch('/api/auth/logout', { method: 'POST' });
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

/**
 * Récupère l'utilisateur actuellement connecté
 */
export const getCurrentUser = async (): Promise<User | null> => {
  // TODO: Appel API réel
  // const token = localStorage.getItem('token');
  // const response = await fetch('/api/auth/me', {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // return response.json();

  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
};

/**
 * Authentification SSO (Single Sign-On)
 */
export const loginWithSSO = async (provider: 'google' | 'microsoft'): Promise<LoginResponse> => {
  // TODO: Implémenter l'authentification SSO
  throw new Error('SSO not implemented yet');
};

