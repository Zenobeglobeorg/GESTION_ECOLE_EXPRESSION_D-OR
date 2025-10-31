/**
 * Service de gestion des notes et évaluations
 * 
 * Gère la saisie et la consultation des notes selon le système pédagogique
 * unique de "Expression d'Or" (paliers, compétences, niveaux de maîtrise).
 */

export interface Competency {
  id: string;
  name: string;
  subjectId: string;
}

export interface Subject {
  id: string;
  name: string;
  competencies: Competency[];
}

export interface Palier {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
}

export interface Evaluation {
  id: string;
  name: string;
  palierId: string;
  competencyId: string;
  date: string;
  type: 'numeric' | 'smiley' | 'acquired'; // numeric pour /10, smiley pour pré-primaire, acquired pour acquis/non acquis
}

export interface Grade {
  id: string;
  studentId: string;
  evaluationId: string;
  score?: number; // Pour les notes /10
  evaluationText?: string; // Pour "Acquis", "Non acquis", ou smileys
  teacherComments?: string;
}

export type MasteryLevel = 'NON_MAITRISE' | 'MAITRISE_PARTIELLE' | 'MAITRISE_MINIMALE' | 'MAITRISE_MAXIMALE' | 'EXCELLENT';

export interface CompetencyMastery {
  competencyId: string;
  competencyName: string;
  averageScore: number;
  masteryLevel: MasteryLevel;
}

/**
 * Récupère les notes d'un élève pour un palier donné
 */
export const getStudentGrades = async (studentId: string, palierId: string): Promise<Grade[]> => {
  // TODO: Appel API réel
  // const response = await fetch(`/api/students/${studentId}/grades?palierId=${palierId}`);
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      studentId,
      evaluationId: '1',
      score: 7,
      teacherComments: 'Bon travail, continuez ainsi',
    },
    {
      id: '2',
      studentId,
      evaluationId: '2',
      score: 8,
    },
  ];
};

/**
 * Saisit une note pour un élève
 */
export const submitGrade = async (grade: Omit<Grade, 'id'>): Promise<Grade> => {
  // TODO: Appel API réel
  // const response = await fetch('/api/grades', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(grade),
  // });
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    id: Date.now().toString(),
    ...grade,
  };
};

/**
 * Calcule le niveau de maîtrise d'une compétence
 * 
 * Règles de calcul selon le système "Expression d'Or":
 * - Non Maîtrise (N M) : 0 à 2 points
 * - Maîtrise Partielle (Part) : 3 à 4 points
 * - Maîtrise Minimale (Mini) : 5 à 7 points
 * - Maîtrise Maximale (Maxi) : 8 à 9 points
 * - Excellent : 10 points
 */
export const calculateMasteryLevel = (averageScore: number): MasteryLevel => {
  if (averageScore >= 0 && averageScore <= 2) return 'NON_MAITRISE';
  if (averageScore >= 3 && averageScore <= 4) return 'MAITRISE_PARTIELLE';
  if (averageScore >= 5 && averageScore <= 7) return 'MAITRISE_MINIMALE';
  if (averageScore >= 8 && averageScore <= 9) return 'MAITRISE_MAXIMALE';
  if (averageScore === 10) return 'EXCELLENT';
  return 'NON_MAITRISE';
};

/**
 * Récupère les niveaux de maîtrise d'un élève pour un palier
 */
export const getStudentMasteryLevels = async (
  studentId: string,
  palierId: string
): Promise<CompetencyMastery[]> => {
  // TODO: Appel API réel - Ce calcul devrait être fait côté backend
  // const response = await fetch(`/api/students/${studentId}/mastery-levels?palierId=${palierId}`);
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data
  return [
    {
      competencyId: '1',
      competencyName: 'Nombres et opérations',
      averageScore: 7.5,
      masteryLevel: 'MAITRISE_MINIMALE',
    },
    {
      competencyId: '2',
      competencyName: 'Lecture',
      averageScore: 8.5,
      masteryLevel: 'MAITRISE_MAXIMALE',
    },
  ];
};

