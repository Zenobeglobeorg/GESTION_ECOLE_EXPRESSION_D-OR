const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Bulletin {
  id: number;
  studentId: number;
  academicYear: string;
  type: 'MATERNELLE' | 'PRIMAIRE';
  data: any; // JSON data
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulletinData {
  studentId: number;
  academicYear: string;
  type: 'MATERNELLE' | 'PRIMAIRE';
  data: any;
  isPublished?: boolean;
}

export interface UpdateBulletinData {
  data?: any;
  isPublished?: boolean;
}

/**
 * Récupère un bulletin par ID
 */
export async function getBulletin(bulletinId: number): Promise<Bulletin> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/bulletins/${bulletinId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du bulletin');
  }

  return response.json();
}

/**
 * Récupère les bulletins d'un élève
 */
export async function getStudentBulletins(studentId: number, academicYear?: string): Promise<Bulletin[]> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Non authentifié');

  const params = new URLSearchParams();
  if (academicYear) params.append('academicYear', academicYear);

  const response = await fetch(`${API_BASE_URL}/api/bulletins/student/${studentId}?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des bulletins');
  }

  return response.json();
}

/**
 * Crée un nouveau bulletin
 */
export async function createBulletin(data: CreateBulletinData): Promise<Bulletin> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/bulletins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création du bulletin');
  }

  return response.json();
}

/**
 * Met à jour un bulletin
 */
export async function updateBulletin(bulletinId: number, data: UpdateBulletinData): Promise<Bulletin> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/bulletins/${bulletinId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du bulletin');
  }

  return response.json();
}

/**
 * Supprime un bulletin
 */
export async function deleteBulletin(bulletinId: number): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/bulletins/${bulletinId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression du bulletin');
  }
}

/**
 * Publie un bulletin (le rend visible aux parents)
 */
export async function publishBulletin(bulletinId: number): Promise<Bulletin> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/bulletins/${bulletinId}/publish`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la publication du bulletin');
  }

  return response.json();
}

/**
 * Dépublie un bulletin (le rend invisible aux parents)
 */
export async function unpublishBulletin(bulletinId: number): Promise<Bulletin> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/bulletins/${bulletinId}/unpublish`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la dépublication du bulletin');
  }

  return response.json();
}

