const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Grade {
  id: number;
  studentId: number;
  subjectId: number | null;
  evaluationId: number;
  grade: number | null; // Note sur 10 (affichage unifié)
  score?: number | null; // Note sur 10 (original)
  evaluationText?: string | null;
  teacherComments?: string | null;
  status: 'pending' | 'validated' | 'rejected';
  date: string;
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    class?: {
      id: number;
      name: string;
    } | null;
  };
  subject?: {
    id: number;
    name: string;
  } | null;
  evaluation?: {
    id: number;
    name: string;
    type: string;
  } | null;
}

export interface CreateGradeData {
  studentId: number;
  evaluationId: number;
  score?: number; // Note sur 20
  evaluationText?: string;
  teacherComments?: string;
}

export interface UpdateGradeData {
  score?: number; // Note sur 10
  evaluationText?: string;
  teacherComments?: string;
  coefficient?: number;
}

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Récupère les notes des enfants du parent connecté (pour les parents)
 */
export const getMyChildrenGrades = async (): Promise<Grade[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades/my-children`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des notes');
  }
  return response.json();
};

export const getGrades = async (classId?: number, subjectId?: number, evaluationId?: number, studentId?: number, status?: string): Promise<Grade[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const params = new URLSearchParams();
  if (classId) params.append('classId', classId.toString());
  if (subjectId) params.append('subjectId', subjectId.toString());
  if (evaluationId) params.append('evaluationId', evaluationId.toString());
  if (studentId) params.append('studentId', studentId.toString());
  if (status) params.append('status', status);

  const url = params.toString()
    ? `${API_BASE_URL}/api/grades?${params.toString()}`
    : `${API_BASE_URL}/api/grades`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des notes');
  }
  return response.json();
};

export const getGradeById = async (id: number): Promise<Grade> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de la note');
  }
  return response.json();
};

export interface BulkGradesData {
  classId: number;
  domainsConfig: Array<{
    code: string;
    label: string;
    competencyBlocks: Array<{
      name: string;
      activities: string[];
    }>;
  }>;
  studentsData: Array<{
    id: number;
    firstName: string;
    lastName: string;
    notes: { [key: string]: number | null };
  }>;
  palierName: string;
  academicYearName: string;
}

export const createBulkGrades = async (data: BulkGradesData): Promise<{ success: boolean; message: string; created: number; errors?: any[] }> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades/bulk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'enregistrement des notes');
  }
  return response.json();
};

export const createGrade = async (data: CreateGradeData): Promise<Grade> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de la note');
  }
  return response.json();
};

export const updateGrade = async (id: number, data: UpdateGradeData): Promise<Grade> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de la note');
  }
  return response.json();
};

export const deleteGrade = async (id: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de la note');
  }
};

export const validateGrade = async (id: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades/${id}/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la validation de la note');
  }
};

export const rejectGrade = async (id: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades/${id}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors du rejet de la note');
  }
};

export const validateAllPendingGrades = async (): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades/validate-all`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la validation des notes');
  }
};

/**
 * Notifie l'enseignant assigné pour lui demander de corriger une note
 */
export const notifyTeacherForGrade = async (gradeId: number, message?: string): Promise<{ message: string; teacherId: number }> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/grades/${gradeId}/notify-teacher`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: message || '' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'envoi de la notification');
  }
  return response.json();
};
