import type { User, UserRole } from '../contexts/AuthContext';

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Authentifie un utilisateur
 * 
 * @param credentials - Email et mot de passe
 * @returns L'utilisateur authentifié et un token JWT
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la connexion');
  }

  const data = await response.json();
  return {
    user: data.user,
    token: data.token,
  };
};

/**
 * Déconnecte l'utilisateur
 */
export const logout = async (): Promise<void> => {
  // Nettoyer le localStorage (le token sera invalidé côté serveur lors de sa prochaine utilisation)
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

/**
 * Récupère l'utilisateur actuellement connecté
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Token invalide');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    // Si le token est invalide, nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Error:', error);
    return null;
  }
};

/**
 * Authentification SSO (Single Sign-On)
 */
/*export const loginWithSSO = async (provider: 'google' | 'microsoft'): Promise<LoginResponse> => {
  // TODO: Implémenter l'authentification SSO
  throw new Error('SSO not implemented yet');
};*/

