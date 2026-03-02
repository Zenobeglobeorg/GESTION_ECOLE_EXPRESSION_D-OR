import { useEffect, useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import * as gradeService from '../../services/gradeService';
import * as classService from '../../services/classService';
import * as subjectService from '../../services/subjectService';
import { BulletinGenerator } from '../../components/bulletins/BulletinGenerator';

const getGradeColor = (grade: number | null): string => {
  if (!grade) return 'bg-gray-100 text-gray-800';
  if (grade >= 8) return 'bg-green-100 text-green-800';
  if (grade >= 7) return 'bg-blue-100 text-blue-800';
  if (grade >= 6) return 'bg-yellow-100 text-yellow-800';
  if (grade >= 5) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export const Grades = () => {
  const [grades, setGrades] = useState<gradeService.Grade[]>([]);
  const [subjects, setSubjects] = useState<subjectService.Subject[]>([]);
  const [classes, setClasses] = useState<classService.Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  
  // View mode: 'table' or 'student'
  const [viewMode, setViewMode] = useState<'table' | 'student'>('table');

  // Edit form
  const [editingGrade, setEditingGrade] = useState<gradeService.Grade | null>(null);
  const [editGrade, setEditGrade] = useState<number>(0);
  const [editCoefficient, setEditCoefficient] = useState(1);
  const [editComment, setEditComment] = useState('');
  const [saving, setSaving] = useState(false);

  // Excel import for bulletins
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Bulletin generation
  const [isBulletinModalOpen, setIsBulletinModalOpen] = useState(false);
  const [selectedStudentForBulletin, setSelectedStudentForBulletin] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    class?: {
      id: number;
      name: string;
      level: string;
    };
  } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [gradesData, subjectsData, classesData] = await Promise.all([
        gradeService.getGrades(),
        subjectService.getSubjects(),
        classService.getClasses(),
      ]);
      setGrades(gradesData);
      setSubjects(subjectsData);
      setClasses(classesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Liste d'élèves uniques (pour filtres)
  const uniqueStudentsForFilter = useMemo(() => {
    const studentsMap = new Map<
      number,
      {
        id: number;
        firstName: string;
        lastName: string;
        classId?: number;
        className?: string;
      }
    >();

    grades.forEach((grade) => {
      if (grade.student && !studentsMap.has(grade.student.id)) {
        studentsMap.set(grade.student.id, {
          id: grade.student.id,
          firstName: grade.student.firstName,
          lastName: grade.student.lastName,
          classId: grade.student.class?.id,
          className: grade.student.class?.name,
        });
      }
    });

    return Array.from(studentsMap.values());
  }, [grades]);

  // Élèves filtrés par classe (pour limiter la liste)
  const studentsForSelectedClass = useMemo(
    () =>
      uniqueStudentsForFilter.filter((s) =>
        filterClass ? s.classId === parseInt(filterClass) : true
      ),
    [uniqueStudentsForFilter, filterClass]
  );

  // Libellé matière détaillé (activité + domaine)
  const getSubjectLabel = (grade: gradeService.Grade): string => {
    if (grade.evaluation?.name) {
      const parts = grade.evaluation.name.split(' - ');
      const activity = parts[0]?.trim();
      const domain = parts[parts.length - 1]?.trim();

      // Exemple de nom: "Lang - CB1 - Communication"
      if (activity && domain && domain !== activity) {
        return `${activity} (${domain})`;
      }
      return grade.evaluation.name;
    }

    return grade.subject?.name || 'N/A';
  };

  const filteredGrades = grades.filter(g => {
    if (filterClass && g.student?.class?.id !== parseInt(filterClass)) return false;
    if (filterSubject && g.subjectId !== parseInt(filterSubject)) return false;
    if (filterStudent && g.student?.id !== parseInt(filterStudent)) return false;
    if (filterStatus && g.status !== filterStatus) return false;
    return true;
  });

  const handleValidateGrade = async (gradeId: number) => {
    setError(null);
    try {
      await gradeService.validateGrade(gradeId);
      setSuccess('Note validée avec succès.');
      await loadData();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setSuccess(null);
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation.');
      setTimeout(() => setError(null), 6000);
    }
  };

  const handleRejectGrade = async (gradeId: number) => {
    if (!confirm('Rejeter cette note ?')) return;
    setError(null);
    try {
      await gradeService.rejectGrade(gradeId);
      setSuccess('Note rejetée.');
      await loadData();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setSuccess(null);
      setError(err instanceof Error ? err.message : 'Erreur lors du rejet.');
      setTimeout(() => setError(null), 6000);
    }
  };

  const handleNotifyTeacher = async (gradeId: number) => {
    setError(null);
    try {
      await gradeService.notifyTeacherForGrade(gradeId);
      setSuccess('Notification envoyée à l\'enseignant avec succès.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setSuccess(null);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la notification.');
      setTimeout(() => setError(null), 6000);
    }
  };

  const handleEdit = (grade: gradeService.Grade) => {
    setEditingGrade(grade);
    setEditGrade(grade.grade ?? grade.score ?? 0);
    setEditCoefficient(1);
    setEditComment(grade.teacherComments || '');
  };

  const handleUpdateGrade = async () => {
    if (!editingGrade) return;
    try {
      setSaving(true);
      setError(null);
      await gradeService.updateGrade(editingGrade.id, {
        score: editGrade,
        teacherComments: editComment,
        coefficient: editCoefficient,
      });
      setSuccess('Note mise à jour avec succès');
      setEditingGrade(null);
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleValidateAll = async () => {
    if (!confirm('Valider toutes les notes en attente ?')) return;
    try {
      await gradeService.validateAllPendingGrades();
      setSuccess('Toutes les notes ont été validées');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setImportFile(file);
        setImportError(null);
      } else {
        setImportError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      }
    }
  };

  const handleSubmitImport = async () => {
    if (!importFile) {
      setImportError('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setImportLoading(true);
      setImportError(null);

      const formData = new FormData();
      formData.append('file', importFile);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/bulletins/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'import');
      }

      const result = await response.json();
      setSuccess(result.message || 'Bulletins générés avec succès');
      setIsImportModalOpen(false);
      setImportFile(null);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setImportLoading(false);
    }
  };

  // Calculer les statistiques
  const pendingCount = grades.filter(g => g.status === 'pending').length;
  const validatedCount = grades.filter(g => g.status === 'validated').length;
  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length).toFixed(1)
    : '0.0';

  // Extraire les élèves uniques pour la génération de bulletins
  const uniqueStudents = useMemo(() => {
    const studentsMap = new Map<number, {
      id: number;
      firstName: string;
      lastName: string;
      class?: {
        id: number;
        name: string;
        level: string;
      };
    }>();
    
    grades.forEach((grade) => {
      if (grade.student && !studentsMap.has(grade.student.id)) {
        studentsMap.set(grade.student.id, {
          id: grade.student.id,
          firstName: grade.student.firstName,
          lastName: grade.student.lastName,
          class: grade.student.class ? {
            id: grade.student.class.id,
            name: grade.student.class.name,
            level: '', // Will be determined from classService if needed
          } : undefined,
        });
      }
    });
    
    return Array.from(studentsMap.values());
  }, [grades]);

  const handleGenerateBulletin = (student: {
    id: number;
    firstName: string;
    lastName: string;
    class?: {
      id: number;
      name: string;
      level?: string;
    } | null;
  }) => {
    setSelectedStudentForBulletin({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      class: student.class ? {
        id: student.class.id,
        name: student.class.name,
        level: student.class.level || '',
      } : undefined,
    });
    setIsBulletinModalOpen(true);
  };

  const handleCloseBulletin = () => {
    setIsBulletinModalOpen(false);
    setSelectedStudentForBulletin(null);
  };

  const handlePrintBulletin = () => {
    window.print();
  };

  if (loading) {
    return (
      <AdminLayout title="Valider et Modifier les Notes" subtitle="Gérer et valider les résultats scolaires.">
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600">Chargement...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Valider et Modifier les Notes"
      subtitle="Gérer et valider les résultats scolaires."
    >
      <ProtectedContent permission="grades.validate" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de consulter les notes.
        </div>
      }>
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300" role="status">
            {success}
          </div>
        )}

        <Card title="Filtres et Recherche" className="mb-8 border-0 shadow-lg">
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="text-sm font-medium text-blue-900" htmlFor="grade-filter-class">Classe</label>
            <select
              id="grade-filter-class"
              className="form-control"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">Toutes les classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-blue-900" htmlFor="grade-filter-subject">Matière</label>
            <select
              id="grade-filter-subject"
              className="form-control"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="">Toutes les matières</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-blue-900" htmlFor="grade-filter-status">Statut</label>
            <select
              id="grade-filter-status"
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="validated">Validé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-blue-900" htmlFor="grade-filter-student">Élève</label>
            <select
              id="grade-filter-student"
              className="form-control"
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
            >
              <option value="">Tous les élèves</option>
              {studentsForSelectedClass.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                  {s.className ? ` - ${s.className}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="Notes en Attente de Validation" className="mb-8 border-0 shadow-lg">
        {/* Onglets pour basculer entre vue tableau et vue par élève */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vue en Tableau
            </button>
            <button
              type="button"
              onClick={() => setViewMode('student')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vue Simple
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          {filteredGrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune note trouvée
            </div>
          ) : viewMode === 'table' ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Note</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map(grade => (
                  <tr key={grade.id}>
                    <td><strong>{grade.student?.firstName} {grade.student?.lastName}</strong></td>
                    <td>{grade.student?.class?.name || 'N/A'}</td>
                    <td>{getSubjectLabel(grade)}</td>
                    <td>
                      {grade.grade !== null && grade.grade !== undefined ? (
                        <span className={`px-2 py-1 rounded font-semibold ${getGradeColor(grade.grade)}`}>
                          {grade.grade.toFixed(1)}/10
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded font-semibold bg-gray-100 text-gray-800">
                          {grade.evaluationText || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        grade.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        grade.status === 'validated' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {grade.status === 'pending' ? 'En attente' : 
                         grade.status === 'validated' ? 'Validé' : 
                         'Rejeté'}
                      </span>
                    </td>
                    <td className="flex flex-wrap gap-2 justify-end">
                      {grade.status === 'pending' && (
                        <>
                          <ProtectedContent permission="grades.validate">
                            <Button
                              size="sm"
                              className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                              onClick={() => handleValidateGrade(grade.id)}
                            >
                              Valider
                            </Button>
                          </ProtectedContent>
                          <ProtectedContent permission="grades.validate">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                              onClick={() => handleRejectGrade(grade.id)}
                            >
                              Rejeter
                            </Button>
                          </ProtectedContent>
                        </>
                      )}
                      <ProtectedContent permission="grades.modify">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                          onClick={() => handleEdit(grade)}
                        >
                          Modifier
                        </Button>
                      </ProtectedContent>
                      <ProtectedContent permission="grades.validate">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-400 text-amber-700 hover:bg-amber-50 hover:border-amber-500"
                          onClick={() => handleNotifyTeacher(grade.id)}
                          title="Demander à l'enseignant de corriger cette note"
                        >
                          Notifier l'enseignant
                        </Button>
                      </ProtectedContent>
                      {grade.student && (
                        <ProtectedContent permission="reports.generate">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500"
                            onClick={() => {
                              const studentClass = grade.student!.class;
                              const classInfo = classes.find(c => c.id === studentClass?.id);
                              handleGenerateBulletin({
                                id: grade.student!.id,
                                firstName: grade.student!.firstName,
                                lastName: grade.student!.lastName,
                                class: studentClass ? {
                                  id: studentClass.id,
                                  name: studentClass.name,
                                  level: classInfo?.level || '',
                                } : null,
                              });
                            }}
                          >
                            📄 Bulletin
                          </Button>
                        </ProtectedContent>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Vue par élève (similaire à celle du parent)
            <div className="space-y-6">
              {(() => {
                // Grouper les notes par élève
                const gradesByStudent = filteredGrades.reduce((acc, grade) => {
                  const studentId = grade.student?.id;
                  if (!studentId) return acc;
                  
                  if (!acc[studentId]) {
                    acc[studentId] = {
                      student: grade.student!,
                      grades: [],
                    };
                  }
                  acc[studentId].grades.push(grade);
                  return acc;
                }, {} as Record<number, { student: { id: number; firstName: string; lastName: string; class?: { id: number; name: string } | null }; grades: gradeService.Grade[] }>);

                // Calculer les moyennes par matière pour chaque élève
                const studentsWithAverages = Object.values(gradesByStudent).map(({ student, grades }) => {
                  // Grouper les notes par matière
                  const gradesBySubject = grades.reduce((acc, grade) => {
                    const subjectName = getSubjectLabel(grade);
                    if (!acc[subjectName]) {
                      acc[subjectName] = [];
                    }
                    acc[subjectName].push(grade);
                    return acc;
                  }, {} as { [key: string]: gradeService.Grade[] });

                  // Calculer les moyennes par matière
                  const subjectAverages = Object.entries(gradesBySubject).map(([subject, subjectGrades]) => {
                    const validGrades = subjectGrades
                      .filter(g => g.grade !== null && g.grade !== undefined)
                      .map(g => g.grade!);
                    const average = validGrades.length > 0
                      ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
                      : 0;
                    return {
                        subject,
                        average,
                        grades: subjectGrades.map(g => ({
                        id: g.id,
                        title: g.evaluation?.name || 'Évaluation',
                        grade: g.grade !== null && g.grade !== undefined ? `${g.grade.toFixed(1)}/10` : g.evaluationText || 'N/A',
                        status: g.status,
                      })),
                    };
                  });

                  return {
                    student,
                    subjectAverages,
                  };
                });

                return studentsWithAverages.map(({ student, subjectAverages }) => (
                  <div
                    key={student.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <h3 className="text-white font-bold text-lg">
                        {student.firstName} {student.lastName}
                        {student.class && (
                          <span className="text-blue-200 text-sm font-normal ml-2">
                            - {student.class.name}
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="p-6">
                      {subjectAverages.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Aucune note disponible
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {subjectAverages.map((subject) => (
                            <div
                              key={subject.subject}
                              className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h4 className="font-semibold text-blue-900">{subject.subject}</h4>
                                <div className="text-right">
                                  <span className="text-xl font-bold text-blue-700">
                                    {subject.average.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-gray-500">/10</span>
                                  <p className="text-xs text-gray-500">Moyenne</p>
                                </div>
                              </div>
                              <div className="p-4 space-y-2">
                                {subject.grades.map((grade) => (
                                  <div
                                    key={grade.id}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                  >
                                    <span className="text-sm text-gray-700">{grade.title}</span>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`text-sm font-bold px-2 py-1 rounded ${
                                        grade.grade.includes('/') 
                                          ? getGradeColor(parseFloat(grade.grade.split('/')[0]) || null)
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {grade.grade}
                                      </span>
                                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        grade.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                        grade.status === 'validated' ? 'bg-green-100 text-green-800' : 
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {grade.status === 'pending' ? 'En attente' : 
                                         grade.status === 'validated' ? 'Validé' : 
                                         'Rejeté'}
                                      </span>
                                      {grade.status === 'pending' && (
                                        <>
                                          <ProtectedContent permission="grades.validate">
                                            <Button
                                              size="sm"
                                              className="bg-green-600 text-white hover:bg-green-700 text-xs"
                                              onClick={() => handleValidateGrade(grade.id)}
                                            >
                                              Valider
                                            </Button>
                                          </ProtectedContent>
                                          <ProtectedContent permission="grades.validate">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                                              onClick={() => handleRejectGrade(grade.id)}
                                            >
                                              Rejeter
                                            </Button>
                                          </ProtectedContent>
                                        </>
                                      )}
                                      <ProtectedContent permission="grades.modify">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 text-xs"
                                          onClick={() => {
                                            const gradeObj = filteredGrades.find(g => g.id === grade.id);
                                            if (gradeObj) handleEdit(gradeObj);
                                          }}
                                        >
                                          Modifier
                                        </Button>
                                      </ProtectedContent>
                                      <ProtectedContent permission="grades.validate">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-amber-400 text-amber-700 hover:bg-amber-50 text-xs"
                                          onClick={() => handleNotifyTeacher(grade.id)}
                                          title="Notifier l'enseignant"
                                        >
                                          Notifier
                                        </Button>
                                      </ProtectedContent>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        <div className="p-4 flex flex-wrap gap-3 border-t border-blue-100">
          <ProtectedContent permission="grades.validate">
            <Button
              className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              onClick={handleValidateAll}
            >
              Valider tout en attente
            </Button>
          </ProtectedContent>
          <ProtectedContent permission="reports.generate">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              onClick={() => setIsImportModalOpen(true)}
            >
              Générer les bulletins (Excel)
            </Button>
          </ProtectedContent>
          {uniqueStudents.length > 0 && (
            <ProtectedContent permission="reports.generate">
              <Button
                variant="outline"
                className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500"
                onClick={() => {
                  // Ouvrir un modal pour sélectionner l'élève
                  if (uniqueStudents.length === 1) {
                    handleGenerateBulletin(uniqueStudents[0]);
                  } else {
                    // Si plusieurs élèves, on peut ouvrir un select ou prendre le premier
                    handleGenerateBulletin(uniqueStudents[0]);
                  }
                }}
              >
                Générer un bulletin
              </Button>
            </ProtectedContent>
          )}
        </div>
      </Card>

      <Card title="Statistiques des Notes" className="mb-8 border-0 shadow-lg">
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-blue-900">Moyenne Générale</h4>
            <div className="text-2xl font-bold text-blue-900 my-2">{averageGrade}/10</div>
            <p className="text-xs text-blue-700/70">Sur {grades.length} note(s)</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-blue-900">Notes en Attente</h4>
            <div className="text-2xl font-bold text-yellow-600 my-2">{pendingCount}</div>
            <p className="text-xs text-blue-700/70">À valider</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-blue-900">Notes Validées</h4>
            <div className="text-2xl font-bold text-green-600 my-2">{validatedCount}</div>
            <p className="text-xs text-blue-700/70">Validées</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-blue-900">Total Notes</h4>
            <div className="text-2xl font-bold text-blue-900 my-2">{grades.length}</div>
            <p className="text-xs text-blue-700/70">Toutes confondues</p>
          </div>
        </div>
      </Card>

      {editingGrade && (
        <Card title="Modification de Note" className="mb-8 border-0 shadow-lg">
          <form className="p-4 space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateGrade(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="edit-grade-student">Élève</label>
                <input 
                  id="edit-grade-student"
                  className="form-control" 
                  value={`${editingGrade.student?.firstName} ${editingGrade.student?.lastName}`} 
                  readOnly 
                  title="Nom de l'élève"
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="edit-grade-subject">Matière</label>
                <input 
                  id="edit-grade-subject"
                  className="form-control" 
                  value={getSubjectLabel(editingGrade)} 
                  readOnly 
                  title="Matière"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="edit-grade-score">Note (/10)</label>
                <input 
                  id="edit-grade-score"
                  type="number" 
                  className="form-control" 
                  min="0" 
                  max="10" 
                  step="0.5" 
                  value={editGrade} 
                  onChange={(e) => setEditGrade(Number(e.target.value))} 
                  required
                  title="Note sur 10"
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="edit-grade-coefficient">Coefficient</label>
                <input 
                  id="edit-grade-coefficient"
                  type="number" 
                  className="form-control" 
                  min="1" 
                  max="10" 
                  value={editCoefficient} 
                  onChange={(e) => setEditCoefficient(Number(e.target.value))} 
                  title="Coefficient de la note"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="edit-grade-comment">Commentaire</label>
              <textarea 
                id="edit-grade-comment"
                className="form-control" 
                rows={3} 
                value={editComment} 
                onChange={(e) => setEditComment(e.target.value)} 
                title="Commentaire sur la note"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <ProtectedContent permission="grades.modify">
                <Button
                  type="submit"
                  className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </ProtectedContent>
              <Button
                type="button"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                onClick={() => setEditingGrade(null)}
                disabled={saving}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card title="Générer les Bulletins depuis Excel" className="w-full max-w-md border-0 shadow-xl">
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Importez un fichier Excel contenant les calculs des bulletins. Le fichier sera utilisé pour générer les bulletins des élèves.
              </p>
              
              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {importError}
                </div>
              )}

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="excel-file">
                  Fichier Excel (.xlsx, .xls)
                </label>
                <input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  className="form-control"
                  onChange={handleImportFile}
                  title="Sélectionner un fichier Excel"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        if (!token) throw new Error('Non authentifié');
                        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                        const response = await fetch(`${API_BASE_URL}/api/bulletins/template`, {
                          headers: { 'Authorization': `Bearer ${token}` },
                        });
                        if (!response.ok) throw new Error('Erreur lors du téléchargement');
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'template_bulletins.xlsx';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (err) {
                        setImportError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Télécharger le template Excel
                  </button>
                </p>
              </div>

              {importFile && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Fichier sélectionné:</strong> {importFile.name}
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportFile(null);
                    setImportError(null);
                  }}
                  disabled={importLoading}
                >
                  Annuler
                </Button>
                <ProtectedContent permission="reports.generate">
                  <Button
                    type="button"
                    className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    onClick={handleSubmitImport}
                    disabled={importLoading || !importFile}
                  >
                    {importLoading ? 'Import en cours...' : 'Importer'}
                  </Button>
                </ProtectedContent>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de génération de bulletin */}
      {isBulletinModalOpen && selectedStudentForBulletin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white w-full max-w-7xl max-h-[90vh] overflow-auto m-4 rounded-lg shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-300 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">
                Bulletin de {selectedStudentForBulletin.firstName} {selectedStudentForBulletin.lastName}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrintBulletin}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  🖨️ Imprimer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseBulletin}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  ✕ Fermer
                </Button>
              </div>
            </div>
            <div className="p-4">
              <BulletinGenerator
                student={selectedStudentForBulletin}
                academicYear="2024-2025"
                onClose={handleCloseBulletin}
              />
            </div>
          </div>
        </div>
      )}
      </ProtectedContent>
    </AdminLayout>
  );
};
