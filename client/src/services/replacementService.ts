const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Replacement {
  id: number;
  absentTeacherId: number;
  replacementTeacherId: number;
  startDate: string;
  endDate: string;
  reason: 'MALADIE' | 'FORMATION' | 'CONGES' | 'PERSONNEL' | 'AUTRE';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  absentTeacher?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  replacementTeacher?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateReplacementData {
  absentTeacherId: number;
  replacementTeacherId: number;
  startDate: string;
  endDate: string;
  reason: 'MALADIE' | 'FORMATION' | 'CONGES' | 'PERSONNEL' | 'AUTRE';
  notes?: string;
}

export interface UpdateReplacementData {
  absentTeacherId?: number;
  replacementTeacherId?: number;
  startDate?: string;
  endDate?: string;
  reason?: 'MALADIE' | 'FORMATION' | 'CONGES' | 'PERSONNEL' | 'AUTRE';
  notes?: string | null;
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getReplacements = async (status?: string, teacherId?: number): Promise<Replacement[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (teacherId) params.append('teacherId', teacherId.toString());

  const url = params.toString()
    ? `${API_BASE_URL}/api/replacements?${params.toString()}`
    : `${API_BASE_URL}/api/replacements`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des remplacements');
  }
  return response.json();
};

export const getReplacementById = async (id: number): Promise<Replacement> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/replacements/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du remplacement');
  }
  return response.json();
};

export const createReplacement = async (data: CreateReplacementData): Promise<Replacement> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/replacements`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création du remplacement');
  }
  return response.json();
};

export const updateReplacement = async (id: number, data: UpdateReplacementData): Promise<Replacement> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/replacements/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du remplacement');
  }
  return response.json();
};

export const deleteReplacement = async (id: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/replacements/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression du remplacement');
  }
};

