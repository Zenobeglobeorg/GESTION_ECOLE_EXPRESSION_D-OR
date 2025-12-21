import { useState, useEffect, useCallback } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Button } from '../../components/ui/Button';
import * as classService from '../../services/classService';
import * as attendanceService from '../../services/attendanceService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  classId?: number;
}

interface ClassWithSubjects extends classService.Class {
  subjects?: Array<{
    id: number;
    name: string;
    teacherId?: number;
  }>;
}

export function Presence() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [classes, setClasses] = useState<ClassWithSubjects[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [presence, setPresence] = useState<Record<number, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [arrivalTimes, setArrivalTimes] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

      // Ajouter les matières à chaque classe
      const classesWithSubjects = classesData.map((cls) => ({
        ...cls,
        subjects: subjectsByClass.get(cls.id) || [],
      }));

      setClasses(classesWithSubjects);

      // Si une classe est déjà sélectionnée, charger ses élèves
      if (selectedClass) {
        const classData = classesWithSubjects.find(c => c.id === selectedClass);
        if (classData?.students) {
          setStudents(classData.students.map(s => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            classId: classData.id,
          })));
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Charger les présences existantes quand on change de classe ou de date
  useEffect(() => {
    if (selectedClass && attendanceDate) {
      loadExistingAttendances();
    } else {
      // Réinitialiser les présences
      const initialPresence: Record<number, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
      students.forEach(student => {
        initialPresence[student.id] = 'PRESENT';
      });
      setPresence(initialPresence);
      setArrivalTimes({});
      setComments({});
    }
  }, [selectedClass, attendanceDate]);

  // Mettre à jour les élèves quand on change de classe
  useEffect(() => {
    if (selectedClass) {
      const classData = classes.find(c => c.id === selectedClass);
      if (classData?.students) {
        const classStudents = classData.students.map(s => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          classId: classData.id,
        }));
        setStudents(classStudents);
        
        // Initialiser les présences à "PRESENT" par défaut
        const initialPresence: Record<number, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
        classStudents.forEach(student => {
          initialPresence[student.id] = 'PRESENT';
        });
        setPresence(initialPresence);
      } else {
        setStudents([]);
      }
    } else {
      setStudents([]);
    }
  }, [selectedClass, classes]);

  const loadExistingAttendances = async () => {
    if (!selectedClass) return;

    try {
      const existing = await attendanceService.getAttendances({
        classId: selectedClass,
        date: attendanceDate,
      });

      const attendanceMap: Record<number, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
      const arrivalMap: Record<number, string> = {};
      const commentMap: Record<number, string> = {};

      existing.forEach(att => {
        attendanceMap[att.studentId] = att.status;
        if (att.arrivalTime) {
          arrivalMap[att.studentId] = att.arrivalTime;
        }
        if (att.comment) {
          commentMap[att.studentId] = att.comment;
        }
      });

      // Mettre à jour les présences avec les données existantes, ou initialiser à PRESENT
      students.forEach(student => {
        if (!attendanceMap[student.id]) {
          attendanceMap[student.id] = 'PRESENT';
        }
      });

      setPresence(attendanceMap);
      setArrivalTimes(arrivalMap);
      setComments(commentMap);
    } catch (err) {
      console.error('Error loading existing attendances:', err);
      // En cas d'erreur, initialiser à PRESENT
      const initialPresence: Record<number, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
      students.forEach(student => {
        initialPresence[student.id] = 'PRESENT';
      });
      setPresence(initialPresence);
    }
  };

  const handleTogglePresence = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setPresence(prevPresence => ({
      ...prevPresence,
      [studentId]: status,
    }));

    // Si on passe à LATE, initialiser l'heure d'arrivée si elle n'existe pas
    if (status === 'LATE' && !arrivalTimes[studentId]) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setArrivalTimes(prev => ({
        ...prev,
        [studentId]: `${hours}:${minutes}`,
      }));
    }
  };

  const handleSave = async () => {
    if (!selectedClass) {
      setError('Veuillez sélectionner une classe');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (students.length === 0) {
      setError('Aucun élève dans cette classe');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const attendancesToSave = students.map(student => ({
        studentId: student.id,
        status: presence[student.id] || 'PRESENT',
        arrivalTime: presence[student.id] === 'LATE' ? arrivalTimes[student.id] : undefined,
        comment: comments[student.id] || undefined,
      }));

      const result = await attendanceService.markAttendances({
        date: attendanceDate,
        classId: selectedClass,
        attendances: attendancesToSave,
      });

      setSuccess(result.message || 'Présences enregistrées avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving attendance:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement des présences');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const selectedClassData = selectedClass ? classes.find(c => c.id === selectedClass) : null;
  const availableSubjects = selectedClassData?.subjects || [];

  if (loading) {
    return (
      <TeacherLayout title={t('teacher.attendance') || 'Présences'} subtitle={t('teacher.markAttendance') || 'Marquer les présences des élèves'}>
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
    <TeacherLayout title={t('teacher.attendance') || 'Présences'} subtitle={t('teacher.markAttendance') || 'Marquer les présences des élèves'}>
      <div className="space-y-6">
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            {/* Sélection de la classe, date et matière */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="class-select">
                  {t('teacher.class') || 'Classe'}
                </label>
                <select
                  id="class-select"
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={selectedClass || ''}
                  onChange={(e) => {
                    setSelectedClass(e.target.value ? parseInt(e.target.value) : null);
                    setSelectedSubject('');
                  }}
                >
                  <option value="">{t('teacher.selectClass') || 'Sélectionner une classe'}</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="date-select">
                  {t('teacher.date') || 'Date'}
                </label>
                <input
                  id="date-select"
                  type="date"
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="subject-select">
                  {t('teacher.subject') || 'Matière'} ({t('teacher.optional') || 'Optionnel'})
                </label>
                <select
                  id="subject-select"
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedClass || availableSubjects.length === 0}
                >
                  <option value="">{t('teacher.allSubjects') || 'Toutes les matières'}</option>
                  {availableSubjects.map(subj => (
                    <option key={subj.id} value={subj.name}>{subj.name}</option>
                  ))}
                </select>
            </div>
          </div>

            {/* Tableau de présence */}
            {selectedClass && students.length > 0 && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400">
                    {t('teacher.studentList') || 'Liste des élèves'} ({students.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
              <thead>
                      <tr className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white">
                        <th className="px-6 py-4 text-left font-semibold border border-blue-500 dark:border-blue-600">
                          {t('teacher.name') || 'Nom et Prénom'}
                        </th>
                        <th className="px-6 py-4 text-center font-semibold border border-blue-500 dark:border-blue-600">
                          {t('teacher.present') || 'Présent'}
                        </th>
                        <th className="px-6 py-4 text-center font-semibold border border-blue-500 dark:border-blue-600">
                          {t('teacher.absent') || 'Absent'}
                        </th>
                        <th className="px-6 py-4 text-center font-semibold border border-blue-500 dark:border-blue-600">
                          {t('teacher.late') || 'Retard'}
                        </th>
                        {Object.values(presence).some(status => status === 'LATE') && (
                          <th className="px-6 py-4 text-center font-semibold border border-blue-500 dark:border-blue-600">
                            {t('teacher.arrivalTime') || 'Heure d\'arrivée'}
                  </th>
                        )}
                </tr>
              </thead>
              <tbody>
                      {students.map((student) => {
                        const studentPresence = presence[student.id] || 'PRESENT';
                        return (
                          <tr key={student.id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 border border-blue-200 dark:border-gray-600 text-blue-900 dark:text-white font-medium">
                              {student.firstName} {student.lastName}
                            </td>
                            <td
                              className={`px-6 py-4 text-center border border-blue-200 dark:border-gray-600 cursor-pointer transition-all ${
                                studentPresence === 'PRESENT'
                                  ? 'bg-green-500 dark:bg-green-600 text-white font-semibold'
                                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                              }`}
                              onClick={() => handleTogglePresence(student.id, 'PRESENT')}
                            >
                              {studentPresence === 'PRESENT' && '✓'}
                            </td>
                            <td
                              className={`px-6 py-4 text-center border border-blue-200 dark:border-gray-600 cursor-pointer transition-all ${
                                studentPresence === 'ABSENT'
                                  ? 'bg-red-500 dark:bg-red-600 text-white font-semibold'
                                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                              }`}
                              onClick={() => handleTogglePresence(student.id, 'ABSENT')}
                            >
                              {studentPresence === 'ABSENT' && '✗'}
                    </td>
                    <td 
                              className={`px-6 py-4 text-center border border-blue-200 dark:border-gray-600 cursor-pointer transition-all ${
                                studentPresence === 'LATE'
                                  ? 'bg-yellow-500 dark:bg-yellow-600 text-white font-semibold'
                                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                              }`}
                              onClick={() => handleTogglePresence(student.id, 'LATE')}
                            >
                              {studentPresence === 'LATE' && '⏰'}
                            </td>
                            {studentPresence === 'LATE' && (
                              <td className="px-6 py-4 text-center border border-blue-200 dark:border-gray-600">
                                <input
                                  type="time"
                                  className="form-control text-xs dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                  value={arrivalTimes[student.id] || ''}
                                  onChange={(e) => setArrivalTimes(prev => ({
                                    ...prev,
                                    [student.id]: e.target.value,
                                  }))}
                                />
                              </td>
                            )}
                            {Object.values(presence).some(status => status === 'LATE') && studentPresence !== 'LATE' && (
                              <td className="px-6 py-4 text-center border border-blue-200 dark:border-gray-600">
                                -
                    </td>
                            )}
                  </tr>
                        );
                      })}
              </tbody>
            </table>
          </div>
          
                {/* Commentaires optionnels */}
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-400">
                    {t('teacher.comments') || 'Commentaires (optionnel)'}
                  </h4>
                  {students.map(student => (
                    <div key={student.id} className="flex items-center gap-2">
                      <label className="text-xs text-blue-700 dark:text-blue-300 w-32 truncate">
                        {student.firstName} {student.lastName}:
                      </label>
                      <input
                        type="text"
                        className="form-control text-xs flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        value={comments[student.id] || ''}
                        onChange={(e) => setComments(prev => ({
                          ...prev,
                          [student.id]: e.target.value,
                        }))}
                        placeholder={t('teacher.commentPlaceholder') || 'Ex: Maladie, raison personnelle...'}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    title={t('teacher.saveAttendance') || 'Enregistrer les présences'}
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 shadow-lg transition-all"
                  >
                    {saving ? (t('teacher.saving') || 'Enregistrement...') : (t('teacher.save') || 'Enregistrer')}
                  </Button>
                </div>
              </>
            )}

            {selectedClass && students.length === 0 && (
              <div className="text-center py-8 text-blue-600 dark:text-blue-400">
                {t('teacher.noStudentsInClass') || 'Aucun élève dans cette classe'}
              </div>
            )}

            {!selectedClass && (
              <div className="text-center py-8 text-blue-600 dark:text-blue-400">
                {t('teacher.selectClassToStart') || 'Veuillez sélectionner une classe pour commencer'}
              </div>
            )}
        </div>
      </div>
    </div>
    </TeacherLayout>
  );
}

export default Presence;
