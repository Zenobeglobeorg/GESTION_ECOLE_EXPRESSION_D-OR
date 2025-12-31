import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import * as studentService from '../../services/studentService';
import * as classService from '../../services/classService';
import * as attendanceService from '../../services/attendanceService';
import { useLanguage } from '../../contexts/LanguageContext';

export const Attendance = () => {
  const { t } = useLanguage();
  const [students, setStudents] = useState<studentService.Student[]>([]);
  const [classes, setClasses] = useState<classService.Class[]>([]);
  const [attendances, setAttendances] = useState<attendanceService.Attendance[]>([]);
  const [alerts, setAlerts] = useState<attendanceService.AbsenteeismAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceClass, setAttendanceClass] = useState('');
  const [studentsAttendance, setStudentsAttendance] = useState<{ 
    [key: number]: { status: string; arrivalTime?: string; comment?: string } 
  }>({});
  const [saving, setSaving] = useState(false);

  // Stats state
  const [stats, setStats] = useState<attendanceService.AttendanceStats>({ 
    present: 0, 
    absent: 0, 
    late: 0, 
    total: 0 
  });

  // Edit modal state
  const [editingAttendance, setEditingAttendance] = useState<attendanceService.Attendance | null>(null);
  const [editStatus, setEditStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE'>('PRESENT');
  const [editArrivalTime, setEditArrivalTime] = useState('');
  const [editComment, setEditComment] = useState('');

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsData, classesData, alertsData] = await Promise.all([
          studentService.getStudents(),
        classService.getClasses(),
        attendanceService.getAbsenteeismAlerts({ days: 30, minAbsences: 5 }),
      ]);

      setStudents(studentsData);
      setClasses(classesData);
      setAlerts(alertsData);

      // Charger les présences pour la date sélectionnée
      await loadAttendances();
      } catch (err) {
        console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendances = async () => {
    try {
      const params: {
        classId?: number;
        date?: string;
        status?: 'PRESENT' | 'ABSENT' | 'LATE';
      } = {};

      if (filterClass) params.classId = parseInt(filterClass);
      if (filterDate || attendanceDate) params.date = filterDate || attendanceDate;
      if (filterStatus) params.status = filterStatus as 'PRESENT' | 'ABSENT' | 'LATE';

      const [attendancesData, statsData] = await Promise.all([
        attendanceService.getAttendances(params),
        attendanceService.getAttendanceStats(params),
      ]);

      setAttendances(attendancesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading attendances:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des présences');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadAttendances();
    }
  }, [attendanceDate, filterClass, filterDate, filterStatus]);

  // Charger les présences existantes quand on change de classe ou de date
  useEffect(() => {
    if (attendanceClass && attendanceDate) {
      loadExistingAttendances();
    } else {
      setStudentsAttendance({});
    }
  }, [attendanceClass, attendanceDate]);

  const loadExistingAttendances = async () => {
    try {
      const existing = await attendanceService.getAttendances({
        classId: parseInt(attendanceClass),
        date: attendanceDate,
      });

      const attendanceMap: { [key: number]: { status: string; arrivalTime?: string; comment?: string } } = {};
      existing.forEach(att => {
        attendanceMap[att.studentId] = {
          status: att.status.toLowerCase(),
          arrivalTime: att.arrivalTime || undefined,
          comment: att.comment || undefined,
        };
      });

      setStudentsAttendance(attendanceMap);
    } catch (err) {
      console.error('Error loading existing attendances:', err);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceClass) {
      setError('Veuillez sélectionner une classe');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const classStudents = students.filter(s => s.classId === parseInt(attendanceClass));
      const attendancesToSave = classStudents.map(student => ({
        studentId: student.id,
        status: (studentsAttendance[student.id]?.status || 'present') as 'PRESENT' | 'ABSENT' | 'LATE',
        arrivalTime: studentsAttendance[student.id]?.arrivalTime,
        comment: studentsAttendance[student.id]?.comment,
      }));

      const result = await attendanceService.markAttendances({
          date: attendanceDate,
        classId: parseInt(attendanceClass),
        attendances: attendancesToSave,
      });

      setSuccess(result.message);
      await loadAttendances();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (attendance: attendanceService.Attendance) => {
    setEditingAttendance(attendance);
    setEditStatus(attendance.status);
    setEditArrivalTime(attendance.arrivalTime || '');
    setEditComment(attendance.comment || '');
  };

  const handleUpdateAttendance = async () => {
    if (!editingAttendance) return;

    try {
      setSaving(true);
      setError(null);

      await attendanceService.updateAttendance(editingAttendance.id, {
        status: editStatus,
        arrivalTime: editStatus === 'LATE' ? editArrivalTime : null,
        comment: editComment || null,
      });

      setSuccess('Présence mise à jour avec succès');
      setEditingAttendance(null);
      await loadAttendances();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttendance = async (id: number) => {
    if (!confirm('Supprimer cette présence ?')) return;

    try {
      await attendanceService.deleteAttendance(id);
      setSuccess('Présence supprimée avec succès');
      await loadAttendances();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleExport = () => {
    // Créer un CSV des présences
    const headers = ['Élève', 'Classe', 'Date', 'Statut', 'Heure arrivée', 'Commentaire'];
    const rows = attendances.map(att => [
      `${att.student?.firstName || ''} ${att.student?.lastName || ''}`,
      att.class?.name || '',
      new Date(att.date).toLocaleDateString('fr-FR'),
      att.status === 'PRESENT' ? 'Présent' : att.status === 'ABSENT' ? 'Absent' : 'Retard',
      att.arrivalTime || '-',
      att.comment || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `presences_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classStudents = attendanceClass 
    ? students.filter(s => s.classId === parseInt(attendanceClass))
    : [];

  const filteredAttendances = attendances.filter(att => {
    if (filterClass && att.classId !== parseInt(filterClass)) return false;
    if (filterStatus && att.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <AdminLayout title="Gestion des Présences" subtitle="Enregistrer et suivre la présence des élèves">
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600">Chargement...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestion des Présences"
      subtitle="Enregistrer et suivre la présence des élèves"
    >
      <ProtectedContent permission="attendance.manage" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de gérer les présences.
        </div>
      }>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {alerts.length > 0 && (
        <Card title="Alertes et notifications" className="mb-8 border-0 shadow-lg">
            <div className="p-4 space-y-2">
            {alerts.map((alertItem, idx) => (
              <div
                key={idx}
                className="bg-red-100 text-red-800 p-3 rounded-xl flex justify-between items-center"
              >
                <span>
                  ⚠️ {alertItem.student.firstName} {alertItem.student.lastName} : Absentéisme élevé ({alertItem.absencesCount} absences sur {alertItem.period})
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  onClick={() => {
                    const phone = students.find(s => s.id === alertItem.student.id)?.fatherContact || 
                                  students.find(s => s.id === alertItem.student.id)?.motherContact;
                    if (phone) {
                      window.open(`tel:${phone}`);
                    } else {
                      window.alert('Numéro de contact non disponible');
                    }
                  }}
                >
                  Contacter parent
                </Button>
              </div>
            ))}
            </div>
          </Card>
      )}

        <Card 
          title="Enregistrer les présences" 
          className="mb-8 border-0 shadow-lg dark:bg-gray-800"
          headerActions={
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              ℹ️ {t('attendance.adminNote') || 'Note: Les enseignants enregistrent généralement les présences. Cette section permet à l\'admin de corriger ou compléter les données si nécessaire.'}
            </div>
          }
        >
          <form onSubmit={handleMarkAttendance} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="attendance-date">
                Date
              </label>
              <input
                type="date"
                id="attendance-date"
                className="form-control"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
                </div>
                <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="attendance-class">
                Classe
              </label>
              <select
                className="form-control"
                id="attendance-class"
                value={attendanceClass}
                onChange={(e) => setAttendanceClass(e.target.value)}
              >
                    <option value="">Sélectionner une classe</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                  </select>
                </div>
              </div>

          {attendanceClass && classStudents.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-3">Élèves de la classe</h4>
                  <div className="space-y-2">
                {classStudents.map(student => {
                  const attendance = studentsAttendance[student.id] || { status: 'present' };
                  return (
                    <div
                      key={student.id}
                      className="flex flex-col gap-2 p-3 border border-blue-100 rounded-lg bg-white hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor={`status-${student.id}`}
                          className="flex-1 cursor-pointer text-blue-900 font-medium"
                        >
                          {student.firstName} {student.lastName}
                        </label>
                        <select
                          id={`status-${student.id}`}
                          className="form-control text-xs w-32"
                          value={attendance.status}
                          onChange={(e) => setStudentsAttendance(prev => ({
                            ...prev,
                            [student.id]: { ...prev[student.id], status: e.target.value },
                          }))}
                        >
                          <option value="present">Présent</option>
                          <option value="absent">Absent</option>
                          <option value="late">Retard</option>
                        </select>
                      </div>
                      {attendance.status === 'late' && (
                        <div className="form-group">
                          <label className="text-xs text-blue-700" htmlFor={`arrival-${student.id}`}>
                            Heure d'arrivée
                          </label>
                          <input
                            id={`arrival-${student.id}`}
                            type="time"
                            className="form-control text-xs"
                            value={attendance.arrivalTime || ''}
                            onChange={(e) => setStudentsAttendance(prev => ({
                              ...prev,
                              [student.id]: { ...prev[student.id], arrivalTime: e.target.value },
                            }))}
                          />
                        </div>
                      )}
                      <div className="form-group">
                        <label className="text-xs text-blue-700" htmlFor={`comment-${student.id}`}>
                          Commentaire (optionnel)
                        </label>
                        <input
                          id={`comment-${student.id}`}
                          type="text"
                          className="form-control text-xs"
                          value={attendance.comment || ''}
                          onChange={(e) => setStudentsAttendance(prev => ({
                            ...prev,
                            [student.id]: { ...prev[student.id], comment: e.target.value },
                          }))}
                          placeholder="Ex: Maladie, raison personnelle..."
                        />
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              )}

          {attendanceClass && classStudents.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
              Aucun élève dans cette classe
            </div>
          )}

            <ProtectedContent permission="attendance.manage">
              <Button
                type="submit"
                className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                disabled={saving || !attendanceClass || classStudents.length === 0}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les présences'}
              </Button>
            </ProtectedContent>
          </form>
        </Card>

      <Card title="Statistiques des présences" className="mb-8 border-0 shadow-lg">
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-100 text-green-800 p-3 rounded-xl text-center">
                <div className="text-2xl font-bold">{stats.present}</div>
                <p className="text-xs">Présents</p>
              </div>
          <div className="bg-red-100 text-red-800 p-3 rounded-xl text-center">
                <div className="text-2xl font-bold">{stats.absent}</div>
                <p className="text-xs">Absents</p>
              </div>
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-xl text-center">
                <div className="text-2xl font-bold">{stats.late}</div>
                <p className="text-xs">Retards</p>
              </div>
          <div className="bg-blue-100 text-blue-800 p-3 rounded-xl text-center">
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
            </div>
                <p className="text-xs">Taux de présence</p>
              </div>
            </div>
          </Card>

      <Card title="Historique des présences" className="border-0 shadow-lg">
        <div className="p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="text-sm font-medium text-blue-900" htmlFor="filter-class">
              Filtrer par classe
            </label>
            <select
              id="filter-class"
              className="form-control"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">Toutes les classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-blue-900" htmlFor="filter-date">
              Filtrer par date
            </label>
            <input
              type="date"
              id="filter-date"
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium text-blue-900" htmlFor="filter-status">
              Filtrer par statut
            </label>
            <select
              id="filter-status"
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="PRESENT">Présent</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Retard</option>
            </select>
          </div>
        </div>

            <div className="p-4 overflow-x-auto">
          {filteredAttendances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune présence trouvée
            </div>
          ) : (
            <table className="table">
                <thead>
                <tr>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Heure arrivée</th>
                  <th>Commentaire</th>
                  <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {filteredAttendances.map(att => (
                  <tr key={att.id}>
                    <td>
                      <strong>
                        {att.student?.firstName} {att.student?.lastName}
                      </strong>
                    </td>
                    <td>{att.class?.name || 'N/A'}</td>
                    <td>{new Date(att.date).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          att.status === 'PRESENT'
                            ? 'bg-green-100 text-green-800'
                            : att.status === 'ABSENT'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {att.status === 'PRESENT'
                          ? 'Présent'
                          : att.status === 'ABSENT'
                          ? 'Absent'
                          : 'Retard'}
                          </span>
                        </td>
                    <td>{att.arrivalTime || '-'}</td>
                    <td className="text-xs max-w-xs truncate" title={att.comment || ''}>
                      {att.comment || '-'}
                    </td>
                    <td className="flex gap-2 justify-end">
                      <ProtectedContent permission="attendance.manage">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                          onClick={() => handleEdit(att)}
                        >
                          Modifier
                        </Button>
                      </ProtectedContent>
                      <ProtectedContent permission="attendance.manage">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          onClick={() => handleDeleteAttendance(att.id)}
                        >
                          Supprimer
                        </Button>
                      </ProtectedContent>
                    </td>
                      </tr>
                ))}
                </tbody>
              </table>
          )}
        </div>

        <div className="p-4 flex gap-2 border-t border-blue-100">
          <Button
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
            onClick={handleExport}
            disabled={filteredAttendances.length === 0}
          >
            Exporter (CSV)
          </Button>
          <Button
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
            onClick={() => window.print()}
          >
            Imprimer
          </Button>
        </div>
      </Card>

      {editingAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card title="Modifier la présence" className="w-full max-w-md border-0 shadow-xl">
            <div className="p-4 space-y-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="edit-student">
                  Élève
                </label>
                <input
                  id="edit-student"
                  className="form-control"
                  value={`${editingAttendance.student?.firstName} ${editingAttendance.student?.lastName}`}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="edit-status">
                  Statut
                </label>
                <select
                  id="edit-status"
                  className="form-control"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'PRESENT' | 'ABSENT' | 'LATE')}
                >
                  <option value="PRESENT">Présent</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Retard</option>
                </select>
              </div>

              {editStatus === 'LATE' && (
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="edit-arrival">
                    Heure d'arrivée
                  </label>
                  <input
                    id="edit-arrival"
                    type="time"
                    className="form-control"
                    value={editArrivalTime}
                    onChange={(e) => setEditArrivalTime(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="edit-comment">
                  Commentaire
                </label>
                <textarea
                  id="edit-comment"
                  className="form-control"
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Commentaire optionnel..."
                />
            </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  onClick={() => setEditingAttendance(null)}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <ProtectedContent permission="attendance.manage">
                  <Button
                    type="button"
                    className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    onClick={handleUpdateAttendance}
                    disabled={saving}
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </ProtectedContent>
              </div>
            </div>
          </Card>
        </div>
      )}
      </ProtectedContent>
    </AdminLayout>
  );
};
