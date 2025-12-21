const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Assignment {
  id: number;
  classId: number;
  subjectId: number | null;
  teacherId: number;
  title: string;
  description: string | null;
  documentUrl: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    name: string;
  } | null;
  teacher: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateAssignmentData {
  classId: number;
  subjectId?: number;
  title: string;
  description?: string;
  documentUrl?: string;
  dueDate?: string;
}

/**
 * Récupère le token JWT depuis localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Récupère tous les devoirs pour une classe
 */
export const getClassAssignments = async (classId: number): Promise<Assignment[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/assignments/class/${classId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des devoirs');
  }

  return response.json();
};

/**
 * Récupère tous les devoirs pour un enseignant
 */
export const getTeacherAssignments = async (): Promise<Assignment[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/assignments/teacher`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des devoirs');
  }

  return response.json();
};

/**
 * Récupère tous les devoirs pour un parent
 */
export const getParentAssignments = async (): Promise<Assignment[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/assignments/parent`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des devoirs');
  }

  return response.json();
};

/**
 * Crée un nouveau devoir
 */
export const createAssignment = async (data: CreateAssignmentData): Promise<Assignment> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/assignments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création du devoir');
  }

  return response.json();
};

/**
 * Met à jour un devoir
 */
export const updateAssignment = async (assignmentId: number, data: Partial<CreateAssignmentData>): Promise<Assignment> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du devoir');
  }

  return response.json();
};

/**
 * Supprime un devoir
 */
export const deleteAssignment = async (assignmentId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression du devoir');
  }
};

