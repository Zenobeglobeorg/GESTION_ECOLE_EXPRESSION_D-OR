/**
 * Service de gestion des élèves
 * 
 * Contient toutes les fonctions pour interagir avec les données des élèves.
 * Utilise des données mockées pour le développement frontend-first.
 */

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  classId: string;
  className?: string;
  parentIds: string[];
  medicalInfo?: string;
}

/**
 * Récupère tous les élèves d'une classe
 */
export const getStudentsByClass = async (classId: string): Promise<Student[]> => {
  // TODO: Appel API réel
  // const response = await fetch(`/api/classes/${classId}/students`);
  // return response.json();

  // Données mockées
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      firstName: 'Aminata',
      lastName: 'Diop',
      dateOfBirth: '2015-03-15',
      classId,
      className: 'CM1 A',
      parentIds: ['1'],
    },
    {
      id: '2',
      firstName: 'Ibrahima',
      lastName: 'Diallo',
      dateOfBirth: '2015-07-22',
      classId,
      className: 'CM1 A',
      parentIds: ['2'],
    },
    {
      id: '3',
      firstName: 'Fatou',
      lastName: 'Sarr',
      dateOfBirth: '2015-11-08',
      classId,
      className: 'CM1 A',
      parentIds: ['3'],
    },
  ];
};

/**
 * Récupère les informations d'un élève spécifique
 */
export const getStudentById = async (studentId: string): Promise<Student | null> => {
  // TODO: Appel API réel
  // const response = await fetch(`/api/students/${studentId}`);
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    id: studentId,
    firstName: 'Aminata',
    lastName: 'Diop',
    dateOfBirth: '2015-03-15',
    classId: '1',
    className: 'CM1 A',
    parentIds: ['1'],
    medicalInfo: 'Aucune allergie connue',
  };
};

/**
 * Récupère tous les élèves associés à un parent
 */
export const getStudentsByParent = async (parentId: string): Promise<Student[]> => {
  // TODO: Appel API réel
  // const response = await fetch(`/api/parents/${parentId}/students`);
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      firstName: 'Aminata',
      lastName: 'Diop',
      dateOfBirth: '2015-03-15',
      classId: '1',
      className: 'CM1 A',
      parentIds: [parentId],
    },
  ];
};

