import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import * as userService from '../../services/userService';
//import type { UserWithDate } from '../../services/userService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SchoolClass {
  id: number;
  name: string;
  level: string;
  teacherId?: number;
  year?: string;
}

interface Subject {
  id: number;
  name: string;
  classId: number;
  teacherId?: number;
  hours?: number;
}

export const Classes = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<userService.UserWithDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState<number | ''>('');
  const [newClassYear, setNewClassYear] = useState(new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectClassId, setNewSubjectClassId] = useState<number | ''>('');
  const [newSubjectTeacher, setNewSubjectTeacher] = useState<number | ''>('');
  const [newSubjectHours, setNewSubjectHours] = useState<number>(4);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Non authentifié');

        const [classesRes, subjectsRes, users] = await Promise.all([
          fetch(`${API_BASE_URL}/api/classes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
          fetch(`${API_BASE_URL}/api/subjects`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
          userService.getUsers(),
        ]);

        setClasses(classesRes || []);
        setSubjects(subjectsRes || []);
        setTeachers(users.filter(u => u.role === 'TEACHER'));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reload = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const [classesRes, subjectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/classes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
        fetch(`${API_BASE_URL}/api/subjects`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
      ]);
      setClasses(classesRes || []);
      setSubjects(subjectsRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newClassName, level: newClassLevel, teacherId: newClassTeacher || null, year: newClassYear }),
      });
      if (!res.ok) throw new Error('Erreur création classe');
      setNewClassName(''); setNewClassLevel(''); setNewClassTeacher('');
      await reload();
      alert('Classe créée');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newSubjectName, classId: newSubjectClassId, teacherId: newSubjectTeacher || null, hours: newSubjectHours }),
      });
      if (!res.ok) throw new Error('Erreur création matière');
      setNewSubjectName(''); setNewSubjectClassId(''); setNewSubjectTeacher(''); setNewSubjectHours(4);
      await reload();
      alert('Matière ajoutée');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/classes/${classId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erreur suppression');
      await reload();
      alert('Classe supprimée');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/subjects/${subjectId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erreur suppression matière');
      await reload();
      alert('Matière supprimée');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <AdminLayout
      title="Gestion des Classes et Matières"
      subtitle="Créer des classes, assigner des enseignants et ajouter des matières"
      actions={null}
    >
      {loading && <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">Chargement...</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-900">Créer une nouvelle classe</h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="class-name">Nom de la classe</label>
                <input
                  id="class-name"
                  className="form-control"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ex: CM1 A"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="class-level">Niveau</label>
                  <select
                    id="class-level"
                    className="form-control"
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner un niveau</option>
                    <option value="CP">CP</option>
                    <option value="CE1">CE1</option>
                    <option value="CE2">CE2</option>
                    <option value="CM1">CM1</option>
                    <option value="CM2">CM2</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="class-teacher">Enseignant responsable</label>
                  <select
                    id="class-teacher"
                    className="form-control"
                    value={String(newClassTeacher)}
                    onChange={(e) => setNewClassTeacher(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="class-year">Année scolaire</label>
                <input
                  id="class-year"
                  className="form-control"
                  value={newClassYear}
                  onChange={(e) => setNewClassYear(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 border-none hover:from-yellow-500 hover:to-yellow-500 shadow-lg shadow-yellow-200"
              >
                Créer la classe
              </Button>
            </form>
          </div>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-900">Ajouter une matière</h2>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="subject-name">Nom de la matière</label>
                <input
                  id="subject-name"
                  className="form-control"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="subject-class">Classe</label>
                  <select
                    id="subject-class"
                    className="form-control"
                    value={String(newSubjectClassId)}
                    onChange={(e) => setNewSubjectClassId(e.target.value ? Number(e.target.value) : '')}
                    required
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="subject-teacher">Enseignant</label>
                  <select
                    id="subject-teacher"
                    className="form-control"
                    value={String(newSubjectTeacher)}
                    onChange={(e) => setNewSubjectTeacher(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="subject-hours">Heures par semaine</label>
                <input
                  id="subject-hours"
                  type="number"
                  min={1}
                  max={20}
                  className="form-control"
                  value={newSubjectHours}
                  onChange={(e) => setNewSubjectHours(Number(e.target.value))}
                />
              </div>

              <Button type="submit" className="bg-linear-to-r from-blue-600 via-blue-700 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                Ajouter la matière
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-blue-900">Liste des classes</h2>
          <p className="text-sm text-blue-700/80">Vue d’ensemble des classes disponibles et de leurs responsables.</p>
        </div>
        <div className="grid gap-6">
          {classes.length === 0 ? (
            <Card className="border-dashed border-2 border-blue-200 bg-blue-50/20">
              <p className="text-center text-blue-700 py-12">Aucune classe enregistrée pour le moment.</p>
            </Card>
          ) : (
            classes.map(classItem => {
              const classTeachers = teachers.filter(t => t.id === classItem.teacherId);
              const classSubjects = subjects.filter(s => s.classId === classItem.id);
              return (
                <Card key={classItem.id} className="border-0 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-blue-100 pb-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-900">{classItem.name}</h3>
                      <p className="text-sm text-blue-700/70">Niveau : {classItem.level}</p>
                    </div>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {classItem.year}
                    </span>
                  </div>
                  <div className="space-y-3 text-sm text-blue-900">
                    <p>
                      <strong>Enseignant responsable :</strong>{' '}
                      {classTeachers.length > 0 ? (
                        `${classTeachers[0].firstName} ${classTeachers[0].lastName}`
                      ) : (
                        <span className="text-yellow-700 font-medium">Non assigné</span>
                      )}
                    </p>
                    <div>
                      <strong>Matières ({classSubjects.length}) :</strong>
                      <ul className="list-disc ml-6 mt-2 space-y-1 text-blue-800">
                        {classSubjects.map(s => (
                          <li key={s.id}>{s.name}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400"
                        onClick={() => alert('Modifier ' + classItem.id)}
                      >
                        Modifier
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        onClick={() => handleDeleteClass(classItem.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-blue-900">Matières par classe</h2>
          <p className="text-sm text-blue-700/80">Suivi des matières, enseignants assignés et volume horaire.</p>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Classe</th>
                  <th>Enseignant</th>
                  <th>Heures / semaine</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => {
                  const subjectClass = classes.find(c => c.id === subject.classId);
                  const subjectTeacher = teachers.find(t => t.id === subject.teacherId);
                  return (
                    <tr key={subject.id}>
                      <td className="font-semibold text-blue-900">{subject.name}</td>
                      <td>{subjectClass ? subjectClass.name : 'N/A'}</td>
                      <td>{subjectTeacher ? `${subjectTeacher.firstName} ${subjectTeacher.lastName}` : 'N/A'}</td>
                      <td>{subject.hours || 4}h</td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400"
                            onClick={() => alert('Modifier matière ' + subject.id)}
                          >
                            Modifier
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </AdminLayout>
  );
};
