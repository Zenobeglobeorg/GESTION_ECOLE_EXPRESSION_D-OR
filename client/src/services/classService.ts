const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Class {
  id: number;
  name: string;
  level: string;
  academicYear: string;
  teacherId?: number;
  teacher?: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
  };
  students?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
  }>;
  _count?: {
    students: number;
  };
}

export interface CreateClassData {
  name: string;
  level: string;
  academicYear?: string;
  teacherId?: number;
}

export interface UpdateClassData {
  name?: string;
  level?: string;
  academicYear?: string;
  teacherId?: number | null;
}

/**
 * Récupère le token JWT depuis localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Récupère toutes les classes
 */
export const getClasses = async (): Promise<Class[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/classes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des classes');
  }

  return response.json();
};
/**
 * Récupère une classe par ID
 */
export const getClassById = async (classId: number): Promise<Class> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/classes/${classId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de la classe');
  }

  return response.json();
};

/**
 * Trouve ou crée une classe
 */
export const findOrCreateClass = async (classData: CreateClassData): Promise<Class> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/classes/find-or-create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création/recherche de la classe');
  }

  return response.json();
};

/**
 * Crée une nouvelle classe
 */
export const createClass = async (classData: CreateClassData): Promise<Class> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/classes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de la classe');
  }

  return response.json();
};

/**
 * Met à jour une classe
 */
export const updateClass = async (classId: number, classData: UpdateClassData): Promise<Class> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/classes/${classId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de la classe');
  }

  return response.json();
};

/**
 * Supprime une classe
 */
export const deleteClass = async (classId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/classes/${classId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de la classe');
  }
};

/**
 * Récupère les classes de l'enseignant connecté avec leurs élèves
 */
export const getMyClasses = async (): Promise<Class[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/classes/my-classes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des classes');
  }

  return response.json();
};


