const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Payment {
  id: number;
  studentId: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    class?: {
      id: number;
      name: string;
      level?: string;
    };
    parent?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  amount: number;
  dueDate: string;
  paidDate?: string;
  installmentNumber: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  total: number;
  paid: number;
  pending: number;
}

export interface RecordPaymentData {
  paymentId: number;
  amount: number;
  paidDate: string;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
}

/**
 * Récupère le token JWT depuis localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Récupère tous les paiements avec filtres optionnels
 */
export const getPayments = async (params?: {
  classId?: number;
  search?: string;
  status?: string;
}): Promise<Payment[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const queryParams = new URLSearchParams();
  if (params?.classId) queryParams.append('classId', params.classId.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE_URL}/api/payments?${queryParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des paiements');
  }

  return response.json();
};

/**
 * Récupère les statistiques des paiements
 */
export const getPaymentStats = async (): Promise<PaymentStats> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/payments/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des statistiques');
  }

  return response.json();
};

/**
 * Récupère les paiements d'un élève
 */
export const getStudentPayments = async (studentId: number): Promise<Payment[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/payments/student/${studentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des paiements de l\'élève');
  }

  return response.json();
};

/**
 * Enregistre ou met à jour un paiement
 */
export const recordPayment = async (data: RecordPaymentData): Promise<Payment> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/payments/${data.paymentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'enregistrement du paiement');
  }

  return response.json();
};

/**
 * Génère les paiements pour un élève
 */
export const generatePaymentsForStudent = async (studentId: number): Promise<Payment[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/payments/student/${studentId}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la génération des paiements');
  }

  return response.json();
};

/**
 * Envoie un rappel de paiement pour une échéance
 */
export const sendPaymentReminder = async (paymentId: number): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/send-reminder`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'envoi du rappel');
  }

  return response.json();
};

/**
 * Récupère les comptes parents bloqués
 */
export const getBlockedAccounts = async (): Promise<Array<{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isBlocked: boolean;
  students: Array<{
    id: number;
    firstName: string;
    lastName: string;
    payments: Payment[];
  }>;
}>> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/payment-reminders/blocked-accounts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des comptes bloqués');
  }

  return response.json();
};

/**
 * Débloque un compte parent
 */
export const unblockAccount = async (userId: number): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`${API_BASE_URL}/api/payment-reminders/unblock-account/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors du déblocage du compte');
  }

  return response.json();
};

/**
 * Récupère l'historique des rappels de paiement
 */
export const getReminderHistory = async (paymentId?: number): Promise<Array<{
  id: number;
  paymentId: number;
  userId: number;
  sentBy: number | null;
  sentVia: string;
  emailSent: boolean;
  createdAt: string;
  payment: {
    student: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
}>> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const url = paymentId 
    ? `${API_BASE_URL}/api/payment-reminders/reminder-history/${paymentId}`
    : `${API_BASE_URL}/api/payment-reminders/reminder-history`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de l\'historique');
  }

  return response.json();
};







