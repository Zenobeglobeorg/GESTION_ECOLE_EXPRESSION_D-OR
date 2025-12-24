const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface SchoolSettings {
  id: number;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  director: string | null;
  timezone: string;
  language: string;
  dateFormat: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  timezone: string;
  language: string;
  dateFormat: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
}

export interface TwoFactorEnableResponse {
  success: boolean;
  message?: string;
  emailSent: boolean;
  error?: string;
}

/**
 * Récupère les paramètres de l'école
 */
export const getSchoolSettings = async (): Promise<SchoolSettings> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/school`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des paramètres');
  }

  return response.json();
};

/**
 * Met à jour les paramètres de l'école
 */
export const updateSchoolSettings = async (settings: Partial<SchoolSettings>): Promise<SchoolSettings> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/school`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour des paramètres');
  }

  return response.json();
};

/**
 * Récupère les paramètres système
 */
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/system`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des paramètres système');
  }

  return response.json();
};

/**
 * Met à jour les paramètres système
 */
export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/system`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour des paramètres système');
  }

  return response.json();
};

/**
 * Récupère le statut de la 2FA
 */
export const getTwoFactorStatus = async (): Promise<TwoFactorStatus> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/two-factor/status`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du statut 2FA');
  }

  return response.json();
};

/**
 * Active la 2FA (envoie un code par email)
 */
export const enableTwoFactor = async (): Promise<TwoFactorEnableResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/two-factor/enable`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'activation de la 2FA');
  }

  return response.json();
};

/**
 * Vérifie le code et active définitivement la 2FA
 */
export const verifyAndEnableTwoFactor = async (code: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/two-factor/verify`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la vérification du code');
  }

  return response.json();
};

/**
 * Désactive la 2FA
 */
export const disableTwoFactor = async (password: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/two-factor/disable`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la désactivation de la 2FA');
  }

  return response.json();
};


