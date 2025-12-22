const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Parent {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  students?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    fatherName?: string;
    fatherAddress?: string;
    fatherContact?: string;
    motherName?: string;
    motherAddress?: string;
    motherContact?: string;
    guardianName?: string;
    guardianContact?: string;
    authorizedPerson1Name?: string;
    authorizedPerson1Tel?: string;
    authorizedPerson2Name?: string;
    authorizedPerson2Tel?: string;
    class?: {
      id: number;
      name: string;
      level?: string;
    };
  }>;
  parentInfo?: {
    fatherName?: string;
    fatherAddress?: string;
    fatherContact?: string;
    motherName?: string;
    motherAddress?: string;
    motherContact?: string;
    guardianName?: string;
    guardianContact?: string;
    authorizedPerson1Name?: string;
    authorizedPerson1Tel?: string;
    authorizedPerson2Name?: string;
    authorizedPerson2Tel?: string;
  };
}

/**
 * Récupère le token JWT depuis localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Recherche un parent par email
 */
export const searchParent = async (email: string): Promise<Parent> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/parents/search?email=${encodeURIComponent(email)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Parent non trouvé');
  }

  return response.json();
};

/**
 * Récupère tous les enfants d'un parent
 */
export const getParentChildren = async (parentId: number): Promise<Parent> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/parents/${parentId}/students`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des enfants');
  }

  return response.json();
};

/**
 * Récupère un parent par ID
 */
export const getParentById = async (parentId: number): Promise<Parent> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/parents/${parentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du parent');
  }

  return response.json();
};

