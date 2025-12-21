const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  classId?: number;
  class?: {
    id: number;
    name: string;
    level?: string;
  };
  schoolOfOrigin?: string;
  hasDisability: boolean;
  isOrphan: boolean;
  orphanType?: string;
  enrollmentDate: string;
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
  paymentOption: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  lastPaymentDate?: string;
  parentId: number;
  parent: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  classId?: number;
  schoolOfOrigin?: string;
  hasDisability?: boolean;
  disabilityDescription?: string;
  isOrphan?: boolean;
  orphanType?: string;
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
  paymentOption?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  lastPaymentDate?: string;
  parentEmail: string;
}

export interface CreateStudentResponse {
  student: Student;
  parent: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    wasCreated: boolean;
  };
}

/**
 * Récupère le token JWT depuis localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Récupère tous les élèves
 */
export const getStudents = async (): Promise<Student[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/students`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des élèves');
  }

  return response.json();
};

/**
 * Récupère les élèves d'un parent (pour les parents connectés)
 * Utilise l'endpoint spécifique /my-children pour les parents
 */
export const getStudentsByParent = async (parentId?: number): Promise<Student[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  // Utiliser l'endpoint spécifique pour les parents
  const response = await fetch(`${API_BASE_URL}/api/students/my-children`, {
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
 * Crée un nouvel élève
 */
export const createStudent = async (studentData: CreateStudentData): Promise<CreateStudentResponse> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/students`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de l\'élève');
  }

  return response.json();
};

/**
 * Récupère un élève par ID
 */
export const getStudentById = async (studentId: number): Promise<Student> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de l\'élève');
  }

  return response.json();
};

/**
 * Met à jour un élève
 */
export const updateStudent = async (studentId: number, studentData: Partial<CreateStudentData>): Promise<Student> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de l\'élève');
  }

  return response.json();
};

/**
 * Supprime un élève
 */
export const deleteStudent = async (studentId: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de l\'élève');
  }
};
