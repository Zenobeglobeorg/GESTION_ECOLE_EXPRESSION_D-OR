import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import * as studentService from '../../services/studentService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Grade {
  id: number;
  studentId: number;
  subjectId: number;
  evaluationId: number;
  grade: number;
  status: 'pending' | 'validated' | 'rejected';
  date: string;
}

interface Subject {
  id: number;
  name: string;
}

interface SchoolClass {
  id: number;
  name: string;
}

const getGradeColor = (grade: number): string => {
  if (grade >= 16) return 'bg-green-100 text-green-800';
  if (grade >= 14) return 'bg-blue-100 text-blue-800';
  if (grade >= 12) return 'bg-yellow-100 text-yellow-800';
  if (grade >= 10) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export const Grades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<studentService.Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Edit form
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editGrade, setEditGrade] = useState<number>(0);
  const [editCoefficient, setEditCoefficient] = useState(1);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const [s, subj, c] = await Promise.all([
          studentService.getStudents(),
          fetch(`${API_BASE_URL}/api/subjects`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
          fetch(`${API_BASE_URL}/api/classes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
        ]);
        setStudents(s);
        setSubjects(subj || []);
        setClasses(c || []);
        // Mock grades data
        setGrades([
          { id: 1, studentId: 1, subjectId: 1, evaluationId: 1, grade: 15, status: 'pending', date: '2023-10-15' },
          { id: 2, studentId: 2, subjectId: 1, evaluationId: 1, grade: 18, status: 'validated', date: '2023-10-15' },
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    load();
  }, []);

  const filteredGrades = grades.filter(g => {
    if (filterStatus && g.status !== filterStatus) return false;
    return true;
  });

  const handleValidateGrade = async (gradeId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/grades/${gradeId}/validate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur validation');
      setGrades(prev => prev.map(g => g.id === gradeId ? { ...g, status: 'validated' } : g));
      alert('Grade validé');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleRejectGrade = async (gradeId: number) => {
    if (!confirm('Rejeter cette note ?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/grades/${gradeId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur rejet');
      setGrades(prev => prev.map(g => g.id === gradeId ? { ...g, status: 'rejected' } : g));
      alert('Note rejetée');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <AdminLayout
      title="Valider et Modifier les Notes"
      subtitle="Gérer et valider les résultats scolaires."
    >
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
        </div>
      </Card>

      <Card title="Notes en Attente de Validation" className="mb-8 border-0 shadow-lg">
        <div className="p-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Matière</th>
                <th>Note</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map(grade => {
                const student = students.find(s => s.id === grade.studentId);
                const subject = subjects.find(s => s.id === grade.subjectId);
                return (
                  <tr key={grade.id}>
                    <td><strong>{student?.firstName} {student?.lastName}</strong></td>
                    <td>{subject?.name}</td>
                    <td><span className={`px-2 py-1 rounded font-semibold ${getGradeColor(grade.grade)}`}>{grade.grade}/20</span></td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${grade.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : grade.status === 'validated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {grade.status === 'pending' ? 'En attente' : grade.status === 'validated' ? 'Validé' : 'Rejeté'}
                      </span>
                    </td>
                    <td className="flex flex-wrap gap-2 justify-end">
                      {grade.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                            onClick={() => handleValidateGrade(grade.id)}
                          >
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                            onClick={() => handleRejectGrade(grade.id)}
                          >
                            Rejeter
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                        onClick={() => setEditingGrade(grade)}
                      >
                        Modifier
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex flex-wrap gap-3 border-t border-blue-100">
          <Button
            className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            onClick={() => alert('Validation de toutes les notes en attente')}
          >
            Valider tout en attente
          </Button>
          <Button
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
            onClick={() => alert('Export des notes')}
          >
            Exporter les notes
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

      <Card title="Statistiques des Notes" className="mb-8 border-0 shadow-lg">
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Moyenne Générale', value: '14.2/20', trend: '+0.3' },
            { label: 'Notes en Attente', value: String(grades.filter(g => g.status === 'pending').length), trend: 'À valider' },
            { label: 'Taux de Réussite', value: '87%', trend: '+2%' },
            { label: 'Matière Faible', value: 'Math', trend: '11.8/20' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-blue-900">{stat.label}</h4>
              <div className="text-2xl font-bold text-blue-900 my-2">{stat.value}</div>
              <p className="text-xs text-blue-700/70">{stat.trend}</p>
            </div>
          ))}
        </div>
      </Card>

      {editingGrade && (
        <Card title="Modification de Note" className="mb-8 border-0 shadow-lg">
          <form className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900">Élève</label>
                <input className="form-control" value={students.find(s => s.id === editingGrade.studentId)?.firstName} readOnly />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900">Matière</label>
                <input className="form-control" value={subjects.find(s => s.id === editingGrade.subjectId)?.name} readOnly />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900">Note (/20)</label>
                <input type="number" className="form-control" min="0" max="20" step="0.5" value={editGrade || editingGrade.grade} onChange={(e) => setEditGrade(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900">Coefficient</label>
                <input type="number" className="form-control" min="1" max="10" value={editCoefficient} onChange={(e) => setEditCoefficient(Number(e.target.value))} />
              </div>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium text-blue-900">Commentaire</label>
              <textarea className="form-control" rows={3} value={editComment} onChange={(e) => setEditComment(e.target.value)} />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                onClick={() => { alert('Note sauvegardée'); setEditingGrade(null); }}
              >
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                onClick={() => setEditingGrade(null)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}
    </AdminLayout>
  );
};
