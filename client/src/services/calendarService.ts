const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string | null;
  date: string;
  time?: string | null;
  type: 'REUNION' | 'EXAMEN' | 'ACTIVITE' | 'FERIE' | 'AUTRE';
  location?: string | null;
  createdById?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'REUNION' | 'EXAMEN' | 'ACTIVITE' | 'FERIE' | 'AUTRE';
  location?: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  type?: 'REUNION' | 'EXAMEN' | 'ACTIVITE' | 'FERIE' | 'AUTRE';
  location?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Récupère tous les événements avec filtres optionnels
 */
export const getEvents = async (params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
  month?: number;
  year?: number;
}): Promise<CalendarEvent[]> => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.month) queryParams.append('month', params.month.toString());
  if (params?.year) queryParams.append('year', params.year.toString());

  const response = await fetch(`${API_BASE_URL}/api/calendar?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des événements');
  }

  return response.json();
};

/**
 * Récupère un événement par ID
 */
export const getEventById = async (id: number): Promise<CalendarEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/calendar/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de l\'événement');
  }

  return response.json();
};

/**
 * Crée un nouvel événement
 */
export const createEvent = async (data: CreateEventData): Promise<CalendarEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/calendar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de l\'événement');
  }

  return response.json();
};

/**
 * Met à jour un événement
 */
export const updateEvent = async (id: number, data: UpdateEventData): Promise<CalendarEvent> => {
  const response = await fetch(`${API_BASE_URL}/api/calendar/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de l\'événement');
  }

  return response.json();
};

/**
 * Supprime un événement
 */
export const deleteEvent = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/calendar/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de l\'événement');
  }
};


