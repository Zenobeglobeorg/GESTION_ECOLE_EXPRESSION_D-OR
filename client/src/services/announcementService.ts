const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  target: 'ALL_PARENTS' | 'ALL_TEACHERS' | 'ALL_USERS';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'SENT' | 'ARCHIVED';
  createdById?: number | null;
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  sentAt?: string | null;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  target: 'ALL_PARENTS' | 'ALL_TEACHERS' | 'ALL_USERS' | 'SPECIFIC_CLASS';
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  classIds?: number[];
}

export interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  target?: 'ALL_PARENTS' | 'ALL_TEACHERS' | 'ALL_USERS';
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  status?: 'DRAFT' | 'SENT' | 'ARCHIVED';
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Récupère toutes les annonces avec filtres optionnels
 */
export const getAnnouncements = async (params?: {
  target?: string;
  priority?: string;
  status?: string;
}): Promise<Announcement[]> => {
  const queryParams = new URLSearchParams();
  if (params?.target) queryParams.append('target', params.target);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE_URL}/api/announcements?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des annonces');
  }

  return response.json();
};

/**
 * Récupère une annonce par ID
 */
export const getAnnouncementById = async (id: number): Promise<Announcement> => {
  const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de l\'annonce');
  }

  return response.json();
};

/**
 * Crée une nouvelle annonce
 */
export const createAnnouncement = async (data: CreateAnnouncementData): Promise<Announcement> => {
  const response = await fetch(`${API_BASE_URL}/api/announcements`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de l\'annonce');
  }

  return response.json();
};

/**
 * Met à jour une annonce
 */
export const updateAnnouncement = async (id: number, data: UpdateAnnouncementData): Promise<Announcement> => {
  const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de l\'annonce');
  }

  return response.json();
};

/**
 * Supprime une annonce
 */
export const deleteAnnouncement = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de l\'annonce');
  }
};

/**
 * Relance une annonce (crée une copie avec une nouvelle date d'envoi)
 */
export const resendAnnouncement = async (id: number): Promise<Announcement> => {
  const response = await fetch(`${API_BASE_URL}/api/announcements/${id}/resend`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la relance de l\'annonce');
  }

  return response.json();
};

