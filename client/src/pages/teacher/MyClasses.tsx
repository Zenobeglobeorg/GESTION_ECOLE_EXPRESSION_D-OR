import { useState, useEffect, useCallback } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import * as classService from '../../services/classService';
import { useLanguage } from '../../contexts/LanguageContext';

interface ClassWithSubjects extends classService.Class {
  subjects?: Array<{
    id: number;
    name: string;
    teacherId?: number;
  }>;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  classId?: number;
}

export const MyClasses = () => {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassWithSubjects[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // Charger les classes de l'enseignant (avec leurs élèves) et les matières en parallèle
      const [classesData, subjectsRes] = await Promise.all([
        classService.getMyClasses(),
        fetch(`${API_BASE_URL}/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(async (r) => {
            if (!r.ok) return [];
            return r.json();
          })
          .catch(() => []),
      ]);

      // Mapper les matières par classe
      const subjectsByClass = new Map<number, Array<{ id: number; name: string; teacherId?: number }>>();
      if (Array.isArray(subjectsRes)) {
        subjectsRes.forEach((subject: { id: number; name?: string; subject?: { name: string }; classId?: number; teacherId?: number }) => {
          if (subject.classId) {
            if (!subjectsByClass.has(subject.classId)) {
              subjectsByClass.set(subject.classId, []);
            }
            subjectsByClass.get(subject.classId)!.push({
              id: subject.id,
              name: subject.name || subject.subject?.name || '',
              teacherId: subject.teacherId,
            });
          }
        });
      }

      // Ajouter les matières à chaque classe et extraire tous les élèves
      const classesWithSubjects = classesData.map((cls) => ({
        ...cls,
        subjects: subjectsByClass.get(cls.id) || [],
      }));

      // Extraire tous les élèves de toutes les classes
      const allStudentsFromClasses: Student[] = [];
      classesWithSubjects.forEach((cls) => {
        if (cls.students) {
          cls.students.forEach((student) => {
            allStudentsFromClasses.push({
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              classId: cls.id,
            });
          });
        }
      });

      setClasses(classesWithSubjects);
      setAllStudents(allStudentsFromClasses);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStudentsByClass = (classId: number): Student[] => {
    return allStudents.filter((s) => s.classId === classId);
  };

  const selectedClassData = selectedClass ? classes.find((c) => c.id === selectedClass) : null;
  // Utiliser les étudiants directement depuis la classe sélectionnée ou depuis allStudents
  const selectedClassStudents = selectedClassData?.students 
    ? selectedClassData.students.map(s => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        classId: selectedClassData.id,
      }))
    : getStudentsByClass(selectedClass || 0);

  // Calculer les statistiques
  const totalStudents = allStudents.filter((s) =>
    classes.some((c) => c.id === s.classId)
  ).length;
  const allSubjectsSet = new Set<string>();
  classes.forEach((cls) => {
    cls.subjects?.forEach((subj) => allSubjectsSet.add(subj.name));
  });
  const uniqueSubjectsCount = allSubjectsSet.size;

  if (loading) {
    return (
      <TeacherLayout title={t('teacher.myClasses') || 'Mes Classes'} subtitle={t('teacher.manageClasses') || 'Gérer vos classes et vos élèves'}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-600 dark:text-blue-400">{t('common.loading') || 'Chargement...'}</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout title={t('teacher.myClasses') || 'Mes Classes'} subtitle={t('teacher.manageClasses') || 'Gérer vos classes et vos élèves'}>
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title={t('teacher.myClasses') || 'Mes Classes'} subtitle={t('teacher.manageClasses') || 'Gérer vos classes et vos élèves'}>
      <div className="space-y-6">
        {/* Messages d'erreur */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-linear-to-br from-blue-600 to-blue-700 text-white dark:from-blue-700 dark:to-blue-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('teacher.totalClasses') || 'Total Classes'}</h3>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">{classes.length}</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-linear-to-br from-yellow-400 to-yellow-500 text-blue-900 dark:from-yellow-500 dark:to-yellow-600">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('teacher.totalStudents') || 'Total Élèves'}</h3>
                <div className="w-12 h-12 rounded-full bg-blue-900/20 dark:bg-blue-800/30 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">{totalStudents}</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-linear-to-br from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('teacher.subjects') || 'Matières'}</h3>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">{uniqueSubjectsCount}</p>
            </div>
          </Card>
        </div>

        {/* Liste des classes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg dark:bg-gray-800">
              <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4 rounded-t-lg">
                <h3 className="text-white font-bold text-lg">{t('teacher.assignedClasses') || 'Mes Classes Assignées'}</h3>
              </div>
              <div className="p-6 space-y-4">
                {classes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-600 dark:text-blue-400">{t('teacher.noClassesAssigned') || 'Aucune classe assignée'}</p>
                  </div>
                ) : (
                  classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedClass === classItem.id
                          ? 'border-yellow-400 dark:border-yellow-500 bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 shadow-lg'
                          : 'border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 dark:hover:border-gray-500 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedClass(classItem.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-blue-900 dark:text-white mb-1">{classItem.name}</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-400">{t('teacher.level') || 'Niveau'}: {classItem.level}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">{t('teacher.year') || 'Année'}: {classItem.academicYear || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {classItem._count?.students || getStudentsByClass(classItem.id).length}
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('teacher.students') || 'élèves'}</p>
                        </div>
                      </div>

                      {classItem.subjects && classItem.subjects.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-blue-900 dark:text-white mb-2">{t('teacher.taughtSubjects') || 'Matières enseignées'}:</p>
                          <div className="flex flex-wrap gap-2">
                            {classItem.subjects.map((subject, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-linear-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 text-blue-900 dark:text-yellow-300 text-xs font-semibold rounded-full border border-yellow-300 dark:border-yellow-600"
                              >
                                {subject.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link to={`/teacher/Presence?class=${classItem.id}`} className="flex-1">
                          <Button className="w-full bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-semibold py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900">
                            {t('teacher.attendance') || 'Présences'}
                          </Button>
                        </Link>
                        <Link to={`/teacher/RemplitNote?class=${classItem.id}`} className="flex-1">
                          <Button className="w-full bg-linear-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 text-blue-900 dark:text-gray-900 font-semibold py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700">
                            {t('teacher.grades') || 'Notes'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Détails de la classe sélectionnée */}
          <div>
            {selectedClassData ? (
              <Card className="border-0 shadow-lg dark:bg-gray-800 sticky top-4">
                <div className="bg-linear-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 px-6 py-4 rounded-t-lg">
                  <h3 className="text-blue-900 dark:text-gray-900 font-bold text-lg">{t('teacher.details') || 'Détails'} - {selectedClassData.name}</h3>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-white mb-3">{t('teacher.information') || 'Informations'}</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-700 dark:text-blue-300">
                        <span className="font-semibold">{t('teacher.level') || 'Niveau'}:</span> {selectedClassData.level}
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        <span className="font-semibold">{t('teacher.year') || 'Année'}:</span> {selectedClassData.academicYear || 'N/A'}
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        <span className="font-semibold">{t('teacher.students') || 'Élèves'}:</span> {selectedClassData._count?.students || selectedClassStudents.length}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-white mb-3">
                      {t('teacher.studentList') || 'Liste des élèves'} ({selectedClassStudents.length})
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {selectedClassStudents.length === 0 ? (
                        <p className="text-blue-600 dark:text-blue-400 text-sm">{t('teacher.noStudents') || 'Aucun élève'}</p>
                      ) : (
                        selectedClassStudents.map((student) => (
                          <div
                            key={student.id}
                            className="p-2 bg-linear-to-r from-blue-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-200 dark:border-gray-600 text-sm text-blue-900 dark:text-white"
                          >
                            {student.firstName} {student.lastName}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {selectedClassData.subjects && selectedClassData.subjects.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-white mb-3">{t('teacher.subjects') || 'Matières'}</h4>
                      <div className="space-y-2">
                        {selectedClassData.subjects.map((subject, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-linear-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-lg border border-yellow-300 dark:border-yellow-600 text-sm text-blue-900 dark:text-yellow-300 font-medium"
                          >
                            {subject.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="shadow-lg border-dashed border-2 border-blue-200 dark:border-gray-600 bg-blue-50/20 dark:bg-gray-800/50">
                <div className="p-6 text-center">
                  <svg className="w-16 h-16 mx-auto text-blue-300 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">{t('teacher.selectClassForDetails') || 'Sélectionnez une classe pour voir les détails'}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};
