const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  theme?: string | null;
  language?: string | null;
  emailNotifications?: boolean;
  adminThemeColor?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesData {
  theme?: 'light' | 'dark';
  language?: 'fr' | 'en';
  emailNotifications?: boolean;
  adminThemeColor?: 'blue-yellow' | 'green-teal' | 'purple-pink' | 'orange-red' | 'indigo-blue';
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Récupère le profil de l'utilisateur connecté
 */
export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du profil');
  }

  return response.json();
};

/**
 * Met à jour le profil de l'utilisateur connecté
 */
export const updateProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du profil');
  }

  return response.json();
};

/**
 * Change le mot de passe de l'utilisateur connecté
 */
export const changePassword = async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors du changement de mot de passe');
  }

  return response.json();
};

/**
 * Met à jour les préférences de l'utilisateur connecté
 */
export const updatePreferences = async (data: UpdatePreferencesData): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me/preferences`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour des préférences');
  }

  return response.json();
};

