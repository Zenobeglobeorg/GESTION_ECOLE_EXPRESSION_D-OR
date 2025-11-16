import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import * as studentService from '../../services/studentService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Attendance {
  id: number;
  studentId: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  arrivalTime?: string;
  comment?: string;
}

interface SchoolClass {
  id: number;
  name: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export const Attendance = () => {
  const [students, setStudents] = useState<studentService.Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  // Form state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceClass, setAttendanceClass] = useState('');
  const [studentsAttendance, setStudentsAttendance] = useState<{ [key: number]: string }>({});

  // Stats state
  const [stats, setStats] = useState<AttendanceStats>({ present: 0, absent: 0, late: 0, total: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const [s, c] = await Promise.all([
          studentService.getStudents(),
          fetch(`${API_BASE_URL}/api/classes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
        ]);
        setStudents(s);
        setClasses(c || []);
        // Mock attendance data
        setAttendances([
          { id: 1, studentId: 1, date: attendanceDate, status: 'present', comment: '' },
          { id: 2, studentId: 2, date: attendanceDate, status: 'absent', comment: 'Maladie' },
          { id: 3, studentId: 3, date: attendanceDate, status: 'late', arrivalTime: '09:15', comment: 'Raison personnelle' },
        ]);
        updateStats([
          { id: 1, studentId: 1, date: attendanceDate, status: 'present', comment: '' },
          { id: 2, studentId: 2, date: attendanceDate, status: 'absent', comment: 'Maladie' },
          { id: 3, studentId: 3, date: attendanceDate, status: 'late', arrivalTime: '09:15', comment: 'Raison personnelle' },
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStats = (data: Attendance[]) => {
    const s = {
      present: data.filter(a => a.status === 'present').length,
      absent: data.filter(a => a.status === 'absent').length,
      late: data.filter(a => a.status === 'late').length,
      total: data.length,
    };
    setStats(s);
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          date: attendanceDate,
          classId: Number(attendanceClass),
          attendances: Object.entries(studentsAttendance).map(([studentId, status]) => ({
            studentId: Number(studentId),
            status,
          })),
        }),
      });
      if (!res.ok) throw new Error('Erreur enregistrement');
      alert('Présences enregistrées');
      setStudentsAttendance({});
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const classStudents = attendanceClass ? students.filter(s => s.classId === Number(attendanceClass)) : [];

  return (
    <AdminLayout
      title="Gestion des Présences"
      subtitle="Enregistrer et suivre la présence des élèves"
    >
      <Card title="Alertes et notifications" className="mb-8 border-0 shadow-lg">
        <div className="p-4 space-y-2">
          <div className="bg-red-100 text-red-800 p-3 rounded-xl flex justify-between items-center">
            <span>⚠️ Ali Salhi : Absentéisme élevé (8 absences ce mois)</span>
            <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400">
              Contacter parent
            </Button>
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-xl">
            ⏰ Fatima Bennani : Retards répétés (5 cette semaine)
          </div>
        </div>
      </Card>

      <Card title="Enregistrer les présences" className="mb-8 border-0 shadow-lg">
        <form onSubmit={handleMarkAttendance} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="attendance-date">Date</label>
              <input type="date" id="attendance-date" className="form-control" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="attendance-class">Classe</label>
              <select className="form-control" id="attendance-class" value={attendanceClass} onChange={(e) => setAttendanceClass(e.target.value)}>
                <option value="">Sélectionner une classe</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {attendanceClass && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-3">Élèves de la classe</h4>
              <div className="space-y-2">
                {classStudents.map(student => (
                  <div key={student.id} className="flex items-center gap-3 p-2 border border-blue-100 rounded-lg bg-white hover:shadow-sm transition">
                    <label htmlFor={`status-${student.id}`} className="flex-1 cursor-pointer text-blue-900">
                      {student.firstName} {student.lastName}
                    </label>
                    <select
                      id={`status-${student.id}`}
                      className="form-control text-xs w-28"
                      value={studentsAttendance[student.id] || 'present'}
                      onChange={(e) => setStudentsAttendance(prev => ({ ...prev, [student.id]: e.target.value }))}
                    >
                      <option value="present">Présent</option>
                      <option value="absent">Absent</option>
                      <option value="late">Retard</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
            Enregistrer les présences
          </Button>
        </form>
      </Card>

      <Card title="Statistiques des présences du jour" className="mb-8 border-0 shadow-lg">
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
            <div className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%</div>
            <p className="text-xs">Taux de présence</p>
          </div>
        </div>
      </Card>

      <Card title="Historique des absences" className="border-0 shadow-lg">
        <div className="p-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Heure arrivée</th>
                <th>Commentaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(att => {
                const student = students.find(s => s.id === att.studentId);
                return (
                  <tr key={att.id}>
                    <td><strong>{student?.firstName} {student?.lastName}</strong></td>
                    <td>{att.date}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${att.status === 'present' ? 'bg-green-100 text-green-800' : att.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {att.status === 'present' ? 'Présent' : att.status === 'absent' ? 'Absent' : 'Retard'}
                      </span>
                    </td>
                    <td>{att.arrivalTime || '-'}</td>
                    <td className="text-xs">{att.comment || '-'}</td>
                    <td className="text-right">
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => alert('Modifier présence')}>
                        Modifier
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex gap-2 border-t border-blue-100">
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => alert('Export des présences')}>
            Exporter
          </Button>
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => window.print()}>
            Imprimer
          </Button>
        </div>
      </Card>
    </AdminLayout>
  );
};
