const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type ScheduleType = 'SUBJECT' | 'EVENT';

export interface Schedule {
  id: number;
  classId: number;
  dayOfWeek: number; // 1 = Lundi, 2 = Mardi, etc.
  startTime: string; // "07:30"
  endTime: string; // "14:30"
  type: ScheduleType; // SUBJECT ou EVENT
  subjectId?: number | null;
  eventName?: string | null; // Nom de l'événement/activité (ex: "Prière", "Récréation", etc.)
  createdAt: string;
  updatedAt: string;
  class?: {
    id: number;
    name: string;
    level: string;
  };
  subject?: {
    id: number;
    name: string;
  };
}

export interface CreateScheduleData {
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type?: ScheduleType; // Par défaut SUBJECT si non fourni
  subjectId?: number | null;
  eventName?: string | null;
}

export interface UpdateScheduleData {
  classId?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  type?: ScheduleType;
  subjectId?: number | null;
  eventName?: string | null;
}

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getSchedules = async (classId?: number): Promise<Schedule[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const url = classId 
    ? `${API_BASE_URL}/api/schedules?classId=${classId}`
    : `${API_BASE_URL}/api/schedules`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des emplois du temps');
  }
  return response.json();
};

export const getScheduleById = async (id: number): Promise<Schedule> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/schedules/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de l\'emploi du temps');
  }
  return response.json();
};

export const createSchedule = async (data: CreateScheduleData): Promise<Schedule> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/schedules`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création du créneau horaire');
  }
  return response.json();
};

export const updateSchedule = async (id: number, data: UpdateScheduleData): Promise<Schedule> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/schedules/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du créneau horaire');
  }
  return response.json();
};

export const deleteSchedule = async (id: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/schedules/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression du créneau horaire');
  }
};

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export const getClassTimeSlots = async (classId: number): Promise<{ timeSlots: TimeSlot[] | null }> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/schedules/class/${classId}/time-slots`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des créneaux horaires');
  }
  return response.json();
};

export const saveClassTimeSlots = async (classId: number, timeSlots: TimeSlot[]): Promise<{ timeSlots: TimeSlot[] }> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/schedules/class/${classId}/time-slots`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ timeSlots }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la sauvegarde des créneaux horaires');
  }
  return response.json();
};

