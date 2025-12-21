const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Notification {
  id: number;
  userId: number;
  type: 'CALENDAR_EVENT' | 'ASSIGNMENT' | 'ANNOUNCEMENT' | 'GRADE' | 'ATTENDANCE' | 'PAYMENT' | 'BULLETIN';
  title: string;
  content: string;
  isRead: boolean;
  relatedId: number | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCount {
  count: number;
}

/**
 * Récupère le token JWT depuis localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Récupère toutes les notifications pour l'utilisateur connecté
 */
export const getNotifications = async (unreadOnly: boolean = false): Promise<Notification[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/notifications?unreadOnly=${unreadOnly}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des notifications');
  }

  return response.json();
};

/**
 * Marque une notification comme lue
 */
export const markAsRead = async (notificationId: number): Promise<Notification> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de la notification');
  }

  return response.json();
};

/**
 * Marque toutes les notifications comme lues
 */
export const markAllAsRead = async (): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour des notifications');
  }
};

/**
 * Récupère le nombre de notifications non lues
 */
export const getUnreadCount = async (): Promise<UnreadCount> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du nombre de notifications');
  }

  return response.json();
};

/**
 * Supprime une notification
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de la notification');
  }
};

