const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Evaluation {
  id: number;
  name: string;
  type: string;
  classId: number | null;
  subjectId: number | null;
  date: string;
  coefficient: number;
  description?: string | null;
  notifyParents?: boolean;
  subject?: {
    id: number;
    name: string;
  };
}

export interface CreateEvaluationData {
  name: string;
  type: string;
  classId?: number;
  subjectId?: number;
  date: string;
  coefficient?: number;
  description?: string;
  notifyParents?: boolean;
}

export interface UpdateEvaluationData {
  name?: string;
  type?: string;
  classId?: number;
  subjectId?: number;
  date?: string;
  coefficient?: number;
  description?: string;
  notifyParents?: boolean;
}

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getEvaluations = async (classId?: number, subjectId?: number, date?: string): Promise<Evaluation[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const params = new URLSearchParams();
  if (classId) params.append('classId', classId.toString());
  if (subjectId) params.append('subjectId', subjectId.toString());
  if (date) params.append('date', date);

  const url = params.toString()
    ? `${API_BASE_URL}/api/evaluations?${params.toString()}`
    : `${API_BASE_URL}/api/evaluations`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des évaluations');
  }
  return response.json();
};

export const getEvaluationById = async (id: number): Promise<Evaluation> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/evaluations/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de l\'évaluation');
  }
  return response.json();
};

export const createEvaluation = async (data: CreateEvaluationData): Promise<Evaluation> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/evaluations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de l\'évaluation');
  }
  return response.json();
};

export const updateEvaluation = async (id: number, data: UpdateEvaluationData): Promise<Evaluation> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/evaluations/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de l\'évaluation');
  }
  return response.json();
};

export const deleteEvaluation = async (id: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/evaluations/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de l\'évaluation');
  }
};







