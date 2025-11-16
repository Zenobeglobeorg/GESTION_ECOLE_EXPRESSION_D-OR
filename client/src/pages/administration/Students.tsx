import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import * as studentService from '../../services/studentService';
import * as userService from '../../services/userService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const Students = () => {
  const [students, setStudents] = useState<studentService.Student[]>([]);
  const [parents, setParents] = useState<userService.UserWithDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Associate form
  const [assocStudentId, setAssocStudentId] = useState<number | null>(null);
  const [assocParentId, setAssocParentId] = useState<number | null>(null);
  const [assocLoading, setAssocLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, u] = await Promise.all([studentService.getStudents(), userService.getUsers()]);
        setStudents(s);
        // Filter parents by role if available
        setParents(u.filter((x) => x.role === 'PARENT'));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refresh = async () => {
    try {
      const s = await studentService.getStudents();
      setStudents(s);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (studentId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir archiver cet élève ?")) return;
    try {
      await studentService.deleteStudent(studentId);
      setStudents((prev) => prev.filter((p) => p.id !== studentId));
      // Simple feedback
      alert('Élève archivé avec succès');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assocStudentId == null || assocParentId == null) {
      alert('Veuillez sélectionner un élève et un parent');
      return;
    }
    setAssocLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_BASE_URL}/api/students/associate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId: assocStudentId, parentId: assocParentId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur lors de l\'association');
      }

      alert('Association effectuée');
      setAssocParentId(null);
      setAssocStudentId(null);
      await refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setAssocLoading(false);
    }
  };

  const actionButton = (
    <Link to="/admin/students/new">
      <Button
        size="md"
        className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 border-none hover:from-yellow-500 hover:to-yellow-500 shadow-lg shadow-yellow-200"
      >
        Inscrire un élève
      </Button>
    </Link>
  );

  return (
    <AdminLayout
      title="Gestion des Dossiers Élèves"
      subtitle="Liste, association et gestion des élèves"
      actions={actionButton}
    >
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <Card title="Liste des Élèves" className="border-0 shadow-lg">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-blue-700">Chargement...</div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-blue-900">
              <p className="font-semibold">Aucun élève enregistré</p>
              <p className="text-sm text-blue-700/70 mt-1">Commencez par créer une fiche élève.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Date de naissance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Classe</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-blue-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-50">
                {students.map((student) => {
                  const parent = (parents.find((p) => p.id === student.parentId) ?? student.parent) as
                    | { firstName?: string; lastName?: string; email?: string; name?: string }
                    | undefined;
                  const displayName = (() => {
                    if (!parent) return '';
                    if (parent.firstName || parent.lastName) {
                      return `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.trim();
                    }
                    return parent.name ?? '';
                  })();

                  return (
                    <tr key={student.id} className="hover:bg-yellow-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-900">
                          {student.firstName} {student.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                        {new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                          {student.class?.name ?? student.classId ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                        {parent ? (
                          <div className="space-y-1">
                            <p className="font-medium">{displayName}</p>
                            {parent?.email && (
                              <p className="text-xs text-blue-700/70">{parent.email}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-yellow-700 font-medium">Non associé</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                          Actif
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/students/${student.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500"
                            >
                              Modifier
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                            onClick={() => handleDelete(student.id)}
                          >
                            Archiver
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card title="Associer un Élève à un Parent" className="border-0 shadow-lg">
        <form onSubmit={handleAssociate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-blue-900" htmlFor="student-select">Élève</label>
              <select
                id="student-select"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={assocStudentId ?? ''}
                onChange={(e) => setAssocStudentId(e.target.value ? Number(e.target.value) : null)}
                required
              >
                <option value="">Sélectionner un élève</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} - {s.class?.name ?? s.classId ?? 'Non assigné'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-blue-900" htmlFor="parent-select">Parent</label>
              <select
                id="parent-select"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={assocParentId ?? ''}
                onChange={(e) => setAssocParentId(e.target.value ? Number(e.target.value) : null)}
                required
              >
                <option value="">Sélectionner un parent</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} - {p.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              isLoading={assocLoading}
              className="bg-linear-to-r from-blue-600 via-blue-700 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {assocLoading ? 'Association...' : 'Associer'}
            </Button>
          </div>
        </form>
      </Card>
    </AdminLayout>
  );
};
