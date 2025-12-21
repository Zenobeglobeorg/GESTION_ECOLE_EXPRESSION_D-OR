import { useState, useEffect, useCallback } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Button } from '../../components/ui/Button';
import * as classService from '../../services/classService';
import * as gradeService from '../../services/gradeService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Structure de configuration des Domaines et Compétences (basée sur l'image)
interface CompetencyBlock {
  name: string; // CB1, CB2, etc.
  activities: string[]; // Liste des activités/matières (ex: ['Lang', 'Poésie', 'Conte'])
}

interface Domain {
  code: string; // D1, D2, D3
  label: string; // Communication, Mathématiques, Éveil
  competencyBlocks: CompetencyBlock[];
}

// Configuration par défaut (peut être chargée depuis l'API plus tard)
const DEFAULT_DOMAINS_CONFIG: Domain[] = [
  {
    code: 'D1',
    label: 'Communication',
    competencyBlocks: [
      {
        name: 'CB1',
        activities: ['Lang', 'Poésie', 'Conte'],
      },
      {
        name: 'CB2',
        activities: ['Lecture', 'Grammaire', 'Écrit'],
      },
    ],
  },
  {
    code: 'D2',
    label: 'Mathématiques',
    competencyBlocks: [
      {
        name: 'CB1',
        activities: ['Numération', 'Calcul', 'Géométrie'],
      },
      {
        name: 'CB2',
        activities: ['Mesure', 'Résolution', 'Logique'],
      },
    ],
  },
  {
    code: 'D3',
    label: 'Éveil',
    competencyBlocks: [
      {
        name: 'CB1',
        activities: ['Sciences', 'Histoire', 'Géographie'],
      },
      {
        name: 'CB2',
        activities: ['Dessin', 'Musique', 'Sport'],
      },
    ],
  },
];

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  classId?: number;
}

interface StudentNotes {
  [key: string]: number | null; // Clé: "D1-CB1-Lang", Valeur: note (0-10)
}

interface StudentData {
  id: number;
  firstName: string;
  lastName: string;
  notes: StudentNotes;
}

// Générer une clé unique pour une note
const getNoteKey = (domainCode: string, cbName: string, activity: string): string => {
  return `${domainCode}-${cbName}-${activity}`;
};

// Calculer la moyenne pour une CB
const calculateCBAverage = (notes: StudentNotes, domainCode: string, cbName: string, activities: string[]): number | null => {
  const cbNotes = activities
    .map(activity => notes[getNoteKey(domainCode, cbName, activity)])
    .filter(note => note !== null && note !== undefined) as number[];

  if (cbNotes.length === 0) return null;
  const sum = cbNotes.reduce((acc, note) => acc + note, 0);
  return Math.round((sum / cbNotes.length) * 10) / 10; // Arrondir à 1 décimale
};

export default function RemplitNote() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [classes, setClasses] = useState<classService.Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [domainsConfig, setDomainsConfig] = useState<Domain[]>(DEFAULT_DOMAINS_CONFIG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger les classes de l'enseignant
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const classesData = await classService.getMyClasses();
      setClasses(classesData);
    } catch (err) {
      console.error('Error loading classes:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Charger les élèves quand une classe est sélectionnée
  useEffect(() => {
    if (selectedClassId) {
      loadStudents();
    } else {
      setStudentsData([]);
    }
  }, [selectedClassId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (!selectedClass?.students) {
        setStudentsData([]);
        return;
      }

      // Charger les notes existantes pour cette classe
      const existingGrades = await gradeService.getGrades(selectedClassId as number);

      // Créer la structure des données élèves avec leurs notes
      const students: StudentData[] = selectedClass.students.map((student) => {
        const notes: StudentNotes = {};

        // Initialiser toutes les notes à null
        domainsConfig.forEach((domain) => {
          domain.competencyBlocks.forEach((cb) => {
            cb.activities.forEach((activity) => {
              const key = getNoteKey(domain.code, cb.name, activity);
              notes[key] = null;
            });
          });
        });

        // Charger les notes existantes (si le backend supporte cette structure)
        // Pour l'instant, on initialise juste avec null

        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          notes,
        };
      });

      setStudentsData(students);
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des élèves');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une note
  const handleNoteChange = (studentId: number, domainCode: string, cbName: string, activity: string, value: string) => {
    const noteValue = value === '' ? null : Math.max(0, Math.min(10, parseFloat(value) || 0));

    setStudentsData((prevData) =>
      prevData.map((student) => {
        if (student.id === studentId) {
          const updatedNotes = {
            ...student.notes,
            [getNoteKey(domainCode, cbName, activity)]: noteValue,
          };
          return {
            ...student,
            notes: updatedNotes,
          };
        }
        return student;
      })
    );
  };

  // Sauvegarder les notes
  const handleSave = async () => {
    if (!selectedClassId) {
      setError(t('grades.selectClass') || 'Veuillez sélectionner une classe');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Déterminer le nom du palier et de l'année académique
      const now = new Date();
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      const palierName = `Palier ${now.getMonth() + 1} - ${monthNames[now.getMonth()]}`;
      const academicYearName = `${now.getFullYear()}-${now.getFullYear() + 1}`;

      // Enregistrer les notes via l'API
      const result = await gradeService.createBulkGrades({
        classId: selectedClassId as number,
        domainsConfig,
        studentsData,
        palierName,
        academicYearName,
      });

      if (result.errors && result.errors.length > 0) {
        console.warn('Certaines notes n\'ont pas pu être enregistrées:', result.errors);
      }

      setSuccess(result.message || t('grades.saved') || 'Notes enregistrées avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving grades:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  if (loading && !selectedClassId) {
    return (
      <TeacherLayout
        title={t('grades.fillGrades') || "Remplissage de Notes d'évaluations"}
        subtitle={t('grades.enterGrades') || 'Saisir les notes des élèves'}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-600 dark:text-blue-400">{t('common.loading') || 'Chargement...'}</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title={t('grades.fillGrades') || "Remplissage de Notes d'évaluations"}
      subtitle={t('grades.enterGrades') || 'Saisir les notes des élèves'}
    >
      <div className="space-y-4 md:space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Sélection de la classe */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-blue-300 dark:border-gray-700 p-4 md:p-6">
          <div className="relative">
            <label
              htmlFor="classe"
              className="absolute -top-3 left-4 px-2 bg-white dark:bg-gray-800 text-xs md:text-sm font-medium text-blue-900 dark:text-blue-400"
            >
              {t('grades.class') || 'Classe'} *
            </label>
            <select
              id="classe"
              value={String(selectedClassId)}
              onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-blue-300 dark:border-gray-600 rounded-lg bg-linear-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 text-blue-900 dark:text-white text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
            >
              <option value="" disabled>
                {t('grades.selectClass') || 'Sélectionner la classe'}
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Légende des notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-2">
            {t('grades.gradingScale') || 'Barème de notation'}:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-600 dark:text-green-400">A:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {t('grades.masteryMax') || 'Maîtrise maximale (Acquis) 8 à 10 P'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-yellow-600 dark:text-yellow-400">B:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {t('grades.masteryMin') || 'Maîtrise minimale 5 à 7 P'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-600 dark:text-orange-400">C:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {t('grades.masteryPartial') || 'Maîtrise partielle 1 à 4 P'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-600 dark:text-red-400">D:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {t('grades.noMastery') || 'Non maîtrise 0 Point'}
              </span>
            </div>
          </div>
        </div>

        {/* Tableau Desktop et Mobile avec structure Domaines/Compétences */}
        {selectedClassId && studentsData.length > 0 && (
          <>
            {/* Tableau Desktop */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-blue-300 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse min-w-max">
                  {/* En-têtes imbriqués sur 3 niveaux */}
                  <thead>
                    {/* Niveau 1: Domaines */}
                    <tr className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white">
                      <th
                        rowSpan={3}
                        className="sticky left-0 z-30 bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 border-r-2 border-blue-500 dark:border-blue-600 p-3 font-bold text-sm min-w-[150px] shadow-lg"
                      >
                        {t('grades.name') || 'Nom et Prénom'}
                      </th>
                      {domainsConfig.map((domain, domainIndex) => {
                        const domainColSpan = domain.competencyBlocks.reduce(
                          (sum, cb) => sum + cb.activities.length + 1, // +1 pour NM
                          0
                        );
                        return (
                          <th
                            key={domain.code}
                            colSpan={domainColSpan}
                            className="border-r border-blue-500 dark:border-blue-600 p-3 font-bold text-sm text-center"
                          >
                            {domain.code} {domain.label}
                          </th>
                        );
                      })}
                    </tr>
                    {/* Niveau 2: Compétences de Base */}
                    <tr className="bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white">
                      {domainsConfig.flatMap((domain) =>
                        domain.competencyBlocks.map((cb, cbIndex) => {
                          const cbColSpan = cb.activities.length + 1; // +1 pour NM
                          const isLast = cbIndex === domain.competencyBlocks.length - 1;
                          const isLastDomain = domain === domainsConfig[domainsConfig.length - 1];
                          return (
                            <th
                              key={`${domain.code}-${cb.name}`}
                              colSpan={cbColSpan}
                              className={`p-2 font-semibold text-xs text-center ${
                                !isLast || !isLastDomain ? 'border-r border-blue-400 dark:border-blue-500' : ''
                              }`}
                            >
                              {cb.name}
                            </th>
                          );
                        })
                      )}
                    </tr>
                    {/* Niveau 3: Activités + NM */}
                    <tr className="bg-linear-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white">
                      {domainsConfig.flatMap((domain) =>
                        domain.competencyBlocks.flatMap((cb, cbIndex) => {
                          const isLastCB = cbIndex === domain.competencyBlocks.length - 1;
                          const isLastDomain = domain === domainsConfig[domainsConfig.length - 1];
                          const shouldShowBorder = !isLastCB || !isLastDomain;
                          return [
                            ...cb.activities.map((activity) => (
                              <th
                                key={`${domain.code}-${cb.name}-${activity}`}
                                className="p-2 font-medium text-xs text-center border-r border-blue-300 dark:border-blue-400"
                              >
                                {activity}
                              </th>
                            )),
                            <th
                              key={`${domain.code}-${cb.name}-NM`}
                              className={`p-2 font-bold text-xs text-center bg-red-500 dark:bg-red-600 ${
                                shouldShowBorder ? 'border-r border-blue-300 dark:border-blue-400' : ''
                              }`}
                            >
                              NM
                            </th>,
                          ];
                        })
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {studentsData.map((student, studentIndex) => (
                      <tr
                        key={student.id}
                        className={`border-t border-blue-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                          studentIndex % 2 === 0
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-blue-50/30 dark:bg-gray-700/30'
                        }`}
                      >
                        {/* Colonne Nom (fixe) */}
                        <td className="sticky left-0 z-20 bg-inherit border-r-2 border-blue-300 dark:border-gray-600 p-3 text-blue-900 dark:text-white font-medium text-sm shadow-md">
                          {student.firstName} {student.lastName}
                        </td>
                        {/* Colonnes de notes */}
                        {domainsConfig.flatMap((domain) =>
                          domain.competencyBlocks.flatMap((cb, cbIndex) => {
                            const isLastCB = cbIndex === domain.competencyBlocks.length - 1;
                            const isLastDomain = domain === domainsConfig[domainsConfig.length - 1];
                            const shouldShowBorder = !isLastCB || !isLastDomain;
                            return [
                              ...cb.activities.map((activity) => {
                                const noteKey = getNoteKey(domain.code, cb.name, activity);
                                const note = student.notes[noteKey];
                                const noteValue = note !== null && note !== undefined ? note : '';
                                return (
                                  <td
                                    key={`${student.id}-${noteKey}`}
                                    className="p-1 border-r border-blue-200 dark:border-gray-600"
                                  >
                                    <input
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.5"
                                      value={noteValue}
                                      onChange={(e) =>
                                        handleNoteChange(
                                          student.id,
                                          domain.code,
                                          cb.name,
                                          activity,
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-2 py-1 text-center border border-blue-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 text-blue-900 dark:text-white text-sm bg-white dark:bg-gray-700"
                                      placeholder="0"
                                    />
                                  </td>
                                );
                              }),
                              <td
                                key={`${student.id}-${domain.code}-${cb.name}-NM`}
                                className={`p-1 border-blue-200 dark:border-gray-600 bg-red-50 dark:bg-red-900/20 ${
                                  shouldShowBorder ? 'border-r' : ''
                                }`}
                              >
                                <div className="w-full px-2 py-1 text-center text-red-700 dark:text-red-400 font-bold text-sm">
                                  {(() => {
                                    const avg = calculateCBAverage(
                                      student.notes,
                                      domain.code,
                                      cb.name,
                                      cb.activities
                                    );
                                    return avg !== null ? avg.toFixed(1) : '-';
                                  })()}
                                </div>
                              </td>,
                            ];
                          })
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        </div>

            {/* Vue Mobile/Tablette - Cartes par élève */}
            <div className="lg:hidden space-y-4">
              {studentsData.map((student) => (
                <div
                key={student.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-blue-300 dark:border-gray-700 overflow-hidden"
              >
                <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-4 py-3">
                  <h4 className="text-white font-bold text-sm md:text-base">
                    {student.firstName} {student.lastName}
                  </h4>
                </div>
                <div className="p-4 space-y-6">
                  {domainsConfig.map((domain) => (
                    <div key={domain.code}>
                      <h5 className="text-sm md:text-base font-bold text-blue-900 dark:text-blue-400 mb-3">
                        {domain.code} {domain.label}
                      </h5>
                      {domain.competencyBlocks.map((cb) => (
                        <div key={`${domain.code}-${cb.name}`} className="mb-4">
                          <h6 className="text-xs md:text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                            {cb.name}
                          </h6>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {cb.activities.map((activity) => {
                              const noteKey = getNoteKey(domain.code, cb.name, activity);
                              const note = student.notes[noteKey];
                              const noteValue = note !== null && note !== undefined ? note : '';
                              return (
                                <div key={activity} className="flex flex-col">
                                  <label className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                                    {activity}
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={noteValue}
                                    onChange={(e) =>
                                      handleNoteChange(
                                        student.id,
                                        domain.code,
                                        cb.name,
                                        activity,
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-2 text-center border-2 border-blue-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 text-blue-900 dark:text-white font-semibold bg-linear-to-r from-yellow-50 to-white dark:from-gray-700 dark:to-gray-600"
                                    placeholder="0"
          />
        </div>
                              );
                            })}
                          </div>
                          {/* Moyenne CB */}
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-red-700 dark:text-red-400">NM:</span>
                              <span className="text-sm font-bold text-red-700 dark:text-red-400">
                                {(() => {
                                  const avg = calculateCBAverage(
                                    student.notes,
                                    domain.code,
                                    cb.name,
                                    cb.activities
                                  );
                                  return avg !== null ? avg.toFixed(1) : '-';
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedClassId && studentsData.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-blue-300 dark:border-gray-700 p-6 text-center">
            <p className="text-blue-600 dark:text-blue-400">
              {t('grades.noStudents') || 'Aucun élève dans cette classe'}
            </p>
          </div>
        )}

        {!selectedClassId && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-blue-300 dark:border-gray-700 p-6 text-center">
            <p className="text-blue-600 dark:text-blue-400">
              {t('grades.selectClassToStart') || 'Veuillez sélectionner une classe pour commencer'}
            </p>
          </div>
        )}

        {/* Bouton Enregistrer */}
        {selectedClassId && studentsData.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto px-6 md:px-12 py-3 md:py-4 bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-bold text-base md:text-lg rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 shadow-lg transition-all"
            >
              {saving
                ? t('grades.saving') || 'Enregistrement...'
                : t('grades.save') || 'Enregistrer'}
            </Button>
      </div>
        )}
    </div>
    </TeacherLayout>
  );
}
