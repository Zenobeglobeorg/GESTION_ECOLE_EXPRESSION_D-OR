const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Attendance {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  arrivalTime?: string | null;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    class?: {
      id: number;
      name: string;
    };
  };
  class?: {
    id: number;
    name: string;
  };
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface AbsenteeismAlert {
  student: {
    id: number;
    firstName: string;
    lastName: string;
    class?: {
      id: number;
      name: string;
    };
  };
  absencesCount: number;
  period: string;
}

export interface MarkAttendanceData {
  date: string;
  classId: number;
  attendances: Array<{
    studentId: number;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'present' | 'absent' | 'late';
    arrivalTime?: string;
    comment?: string;
  }>;
}

export interface UpdateAttendanceData {
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'present' | 'absent' | 'late';
  arrivalTime?: string | null;
  comment?: string | null;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Récupère toutes les présences avec filtres optionnels
 */
export const getAttendances = async (params?: {
  classId?: number;
  studentId?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE';
}): Promise<Attendance[]> => {
  const queryParams = new URLSearchParams();
  if (params?.classId) queryParams.append('classId', params.classId.toString());
  if (params?.studentId) queryParams.append('studentId', params.studentId.toString());
  if (params?.date) queryParams.append('date', params.date);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE_URL}/api/attendance?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des présences');
  }

  return response.json();
};

/**
 * Récupère une présence par ID
 */
export const getAttendanceById = async (id: number): Promise<Attendance> => {
  const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de la présence');
  }

  return response.json();
};

/**
 * Enregistre les présences pour une classe
 */
export const markAttendances = async (data: MarkAttendanceData): Promise<{
  success: boolean;
  message: string;
  results: {
    created: number;
    updated: number;
    errors: Array<{ studentId: number; message: string }>;
  };
}> => {
  const response = await fetch(`${API_BASE_URL}/api/attendance/mark`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'enregistrement des présences');
  }

  return response.json();
};

/**
 * Met à jour une présence
 */
export const updateAttendance = async (
  id: number,
  data: UpdateAttendanceData
): Promise<Attendance> => {
  const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de la présence');
  }

  return response.json();
};

/**
 * Supprime une présence
 */
export const deleteAttendance = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de la présence');
  }
};

/**
 * Récupère les statistiques de présence
 */
export const getAttendanceStats = async (params?: {
  classId?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceStats> => {
  const queryParams = new URLSearchParams();
  if (params?.classId) queryParams.append('classId', params.classId.toString());
  if (params?.date) queryParams.append('date', params.date);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const response = await fetch(`${API_BASE_URL}/api/attendance/stats?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des statistiques');
  }

  return response.json();
};

/**
 * Récupère les alertes d'absentéisme
 */
export const getAbsenteeismAlerts = async (params?: {
  days?: number;
  minAbsences?: number;
}): Promise<AbsenteeismAlert[]> => {
  const queryParams = new URLSearchParams();
  if (params?.days) queryParams.append('days', params.days.toString());
  if (params?.minAbsences) queryParams.append('minAbsences', params.minAbsences.toString());

  const response = await fetch(`${API_BASE_URL}/api/attendance/alerts?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des alertes');
  }

  return response.json();
};

/**
 * Récupère les présences des enfants du parent connecté
 */
export const getMyChildrenAttendances = async (params?: {
  studentId?: number;
  startDate?: string;
  endDate?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE';
}): Promise<Attendance[]> => {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.append('studentId', params.studentId.toString());
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE_URL}/api/attendance/my-children?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des présences');
  }

  return response.json();
};

/**
 * Récupère les statistiques de présence des enfants du parent connecté
 */
export const getMyChildrenAttendanceStats = async (params?: {
  studentId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceStats> => {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.append('studentId', params.studentId.toString());
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const response = await fetch(`${API_BASE_URL}/api/attendance/my-children/stats?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des statistiques');
  }

  return response.json();
};


