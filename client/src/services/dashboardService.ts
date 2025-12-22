const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface AdminStats {
  students: number;
  classes: number;
  teachers: number;
  pendingPayments: {
    count: number;
    amount: number;
  };
}

export interface SuperAdminStats {
  admins: number;
  teachers: number;
  parents: number;
  students: number;
}

export interface TeacherStats {
  classes: number;
  students: number;
  recentAssignments: Array<{
    id: number;
    title: string;
    class: {
      name: string;
    };
    subject?: {
      name: string;
    };
    createdAt: string;
  }>;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/admin`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur lors de la récupération des statistiques' }));
    throw new Error(error.error || 'Erreur lors de la récupération des statistiques');
  }

  return response.json();
};

export const getSuperAdminStats = async (): Promise<SuperAdminStats> => {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/superadmin`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur lors de la récupération des statistiques' }));
    throw new Error(error.error || 'Erreur lors de la récupération des statistiques');
  }

  return response.json();
};

export const getTeacherStats = async (): Promise<TeacherStats> => {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/teacher`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur lors de la récupération des statistiques' }));
    throw new Error(error.error || 'Erreur lors de la récupération des statistiques');
  }

  return response.json();
};

