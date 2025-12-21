const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Conversation {
  id: number;
  name: string;
  email: string;
  lastMessage: string;
  lastMessageTime: string | null;
  unread: number;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  receiver: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface SendMessageData {
  receiverId: number;
  content: string;
}

export interface UnreadCount {
  unread: number;
}

/**
 * Récupère le token JWT depuis localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Récupère toutes les conversations pour l'utilisateur connecté
 */
export const getConversations = async (): Promise<Conversation[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des conversations');
  }

  return response.json();
};

/**
 * Récupère tous les messages d'une conversation
 */
export const getMessages = async (otherUserId: number): Promise<Message[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${otherUserId}/messages`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des messages');
  }

  return response.json();
};

/**
 * Envoie un nouveau message
 */
export const sendMessage = async (data: SendMessageData): Promise<Message> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'envoi du message');
  }

  return response.json();
};

/**
 * Marque un message comme lu
 */
export const markAsRead = async (messageId: number): Promise<Message> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du message');
  }

  return response.json();
};

/**
 * Récupère le nombre de messages non lus
 */
export const getUnreadCount = async (): Promise<UnreadCount> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/messages/unread-count`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du nombre de messages non lus');
  }

  return response.json();
};



