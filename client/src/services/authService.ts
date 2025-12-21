import type { User } from '../contexts/AuthContext';

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
 * @returns L'utilisateur authentifié et un token JWT, ou un objet avec requiresTwoFactor si 2FA est activée
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse | { requiresTwoFactor: true; emailSent: boolean; devCode?: string }> => {
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

  // Si la 2FA est requise, retourner un objet spécial
  if (data.requiresTwoFactor) {
    return {
      requiresTwoFactor: true,
      emailSent: data.emailSent || false,
      ...(data.devCode && { devCode: data.devCode }),
    };
  }

  return {
    user: data.user,
    token: data.token,
  };
};

/**
 * Vérifie le code 2FA et finalise la connexion
 */
export const verifyTwoFactor = async (email: string, code: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Code invalide ou expiré');
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
 * Demande la réinitialisation du mot de passe
 */
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la demande de réinitialisation');
  }

  return await response.json();
};

/**
 * Réinitialise le mot de passe avec un token
 */
export const resetPassword = async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la réinitialisation');
  }

  return await response.json();
};

/**
 * Change le mot de passe (utilisateur connecté)
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors du changement de mot de passe');
  }

  return await response.json();
};

