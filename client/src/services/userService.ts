import type { User, UserRole } from '../contexts/AuthContext';

// Type étendu pour inclure createdAt et les champs enseignants (retournés par l'API)
export interface UserWithDate extends User {
  createdAt: string;
  teacherLevel?: 'MATERNELLE' | 'PRE_PRIMAIRE' | 'PRIMAIRE' | null;
  teacherStatus?: 'PERMANENT' | 'CONSULTANT' | 'VACATAIRE' | null;
  employmentStartDate?: string | null;
  employmentEndDate?: string | null;
  function?: string | null; // Fonction de l'administrateur
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  customRoleId?: number;
  teacherLevel?: 'MATERNELLE' | 'PRE_PRIMAIRE' | 'PRIMAIRE';
  teacherStatus?: 'PERMANENT' | 'CONSULTANT' | 'VACATAIRE';
  employmentStartDate?: string;
  employmentEndDate?: string;
  function?: string; // Fonction de l'administrateur (Directeur, Fondateur, etc.)
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  customRoleId?: number | null;
  teacherLevel?: 'MATERNELLE' | 'PRE_PRIMAIRE' | 'PRIMAIRE' | null;
  teacherStatus?: 'PERMANENT' | 'CONSULTANT' | 'VACATAIRE' | null;
  employmentStartDate?: string | null;
  employmentEndDate?: string | null;
  function?: string | null; // Fonction de l'administrateur
}

/**
 * Récupère le token JWT depuis localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Récupère tous les utilisateurs
 */
export const getUsers = async (): Promise<UserWithDate[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des utilisateurs');
  }

  return response.json();
};

/**
 * Crée un nouvel utilisateur
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de l\'utilisateur');
  }

  return response.json();
};

/**
 * Récupère un utilisateur par ID
 */
export const getUserById = async (userId: number): Promise<User> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de l\'utilisateur');
  }

  return response.json();
};

/**
 * Met à jour un utilisateur
 */
export const updateUser = async (userId: number, userData: UpdateUserData): Promise<User> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de l\'utilisateur');
  }

  return response.json();
};

/**
 * Supprime un utilisateur
 * @param userId - ID de l'utilisateur à supprimer
 * @param deleteWithChildren - Si true, supprime aussi les enfants associés (pour les parents). Si false, désassocie les enfants.
 */
export const deleteUser = async (userId: number, deleteWithChildren?: boolean): Promise<{ success: boolean; message: string; deletedChildren?: number; disassociatedChildren?: number }> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deleteWithChildren }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de l\'utilisateur');
  }

  return response.json();
};

/**
 * Récupère les permissions d'un utilisateur
 */
export const getUserPermissions = async (userId: number): Promise<{ permissions: Array<{ id: number; key: string; name: string; description?: string; category: string }>; isSuperAdmin: boolean }> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/permissions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des permissions');
  }

  return response.json();
};

/**
 * Met à jour les permissions d'un utilisateur
 */
export const updateUserPermissions = async (userId: number, permissionKeys: string[]): Promise<{ success: boolean; message: string; permissions: Array<{ id: number; key: string; name: string }> }> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/permissions`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ permissions: permissionKeys }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour des permissions');
  }

  return response.json();
};

