const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Subject {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getSubjects = async (): Promise<Subject[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  // Utiliser la route /available pour obtenir la liste des matières disponibles
  const response = await fetch(`${API_BASE_URL}/api/subjects/available`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des matières');
  }
  return response.json();
};

export const getSubjectById = async (id: number): Promise<Subject> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/subjects/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de la matière');
  }
  return response.json();
};

