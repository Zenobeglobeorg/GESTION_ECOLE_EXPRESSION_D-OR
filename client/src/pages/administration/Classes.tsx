import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { AdminLayout } from '../../components/admin/AdminLayout';
import * as userService from '../../services/userService';
import * as classService from '../../services/classService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Subject {
  id: number;
  name: string;
  classId: number;
  teacherId?: number;
  hours?: number;
}

export const Classes = () => {
  const [classes, setClasses] = useState<classService.Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<userService.UserWithDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states pour création
  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState<number | ''>('');
  const [newClassYear, setNewClassYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectClassId, setNewSubjectClassId] = useState<number | ''>('');
  const [newSubjectTeacher, setNewSubjectTeacher] = useState<number | ''>('');
  const [newSubjectHours, setNewSubjectHours] = useState<number>(4);

  // États pour modification
  const [editingClass, setEditingClass] = useState<classService.Class | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    level: '',
    academicYear: '',
    teacherId: '' as number | '',
  });

  // États pour association d'enseignant
  const [associatingClass, setAssociatingClass] = useState<classService.Class | null>(null);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');

  // États pour modification de matière
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [editSubjectForm, setEditSubjectForm] = useState({
    teacherId: '' as number | '',
    hours: 4,
  });

  const levels = [
    { value: 'Maternelle', label: 'Maternelle' },
    { value: 'Pré-primaire', label: 'Pré-primaire' },
    { value: 'Primaire', label: 'Primaire' },
    { value: 'CP', label: 'CP' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const [classesData, subjectsRes, users] = await Promise.all([
        classService.getClasses(),
        fetch(`${API_BASE_URL}/api/subjects`, { headers: { Authorization: `Bearer ${token}` } })
          .then(async (r) => {
            if (!r.ok) {
              // Si l'endpoint retourne une erreur, retourner un tableau vide
              console.warn('Erreur lors du chargement des matières, utilisation d\'un tableau vide');
              return [];
            }
            return r.json();
          })
          .catch(() => {
            // En cas d'erreur, retourner un tableau vide
            console.warn('Impossible de charger les matières, utilisation d\'un tableau vide');
            return [];
          }),
        userService.getUsers(),
      ]);

      setClasses(classesData);
      setSubjects(Array.isArray(subjectsRes) ? subjectsRes : []);
      setTeachers(users.filter(u => u.role === 'TEACHER'));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await classService.createClass({
        name: newClassName,
        level: newClassLevel,
        academicYear: newClassYear,
        teacherId: newClassTeacher || undefined,
      });
      setNewClassName('');
      setNewClassLevel('');
      setNewClassTeacher('');
      setSuccess('Classe créée avec succès');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la classe');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newSubjectName, classId: newSubjectClassId, teacherId: newSubjectTeacher || null, hours: newSubjectHours }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erreur lors de la création de la matière' }));
        throw new Error(errorData.error || 'Erreur lors de la création de la matière');
      }
      
      await res.json(); // Lire la réponse même si on ne l'utilise pas
      setNewSubjectName('');
      setNewSubjectClassId('');
      setNewSubjectTeacher('');
      setNewSubjectHours(4);
      setSuccess('Matière ajoutée avec succès');
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la matière';
      setError(errorMessage);
      console.error('Erreur lors de la création de la matière:', err);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) return;
    setError(null);
    setSuccess(null);
    try {
      await classService.deleteClass(classId);
      setSuccess('Classe supprimée avec succès');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setEditSubjectForm({
      teacherId: subject.teacherId || '',
      hours: subject.hours || 4,
    });
    setIsEditSubjectModalOpen(true);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const res = await fetch(`${API_BASE_URL}/api/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacherId: editSubjectForm.teacherId || null,
          hours: editSubjectForm.hours,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erreur lors de la modification de la matière' }));
        throw new Error(errorData.error || 'Erreur lors de la modification de la matière');
      }

      setSuccess('Matière modifiée avec succès');
      setIsEditSubjectModalOpen(false);
      setEditingSubject(null);
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de la matière';
      setError(errorMessage);
      console.error('Erreur lors de la modification de la matière:', err);
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/subjects/${subjectId}`, { 
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erreur lors de la suppression de la matière' }));
        throw new Error(errorData.error || 'Erreur lors de la suppression de la matière');
      }
      
      setSuccess('Matière supprimée avec succès');
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la matière';
      setError(errorMessage);
      console.error('Erreur lors de la suppression de la matière:', err);
    }
  };

  const handleEdit = (classItem: classService.Class) => {
    setEditingClass(classItem);
    setEditForm({
      name: classItem.name,
      level: classItem.level,
      academicYear: classItem.academicYear,
      teacherId: classItem.teacherId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    setError(null);
    setSuccess(null);
    try {
      await classService.updateClass(editingClass.id, {
        name: editForm.name,
        level: editForm.level,
        academicYear: editForm.academicYear,
        teacherId: editForm.teacherId || null,
      });
      setSuccess('Classe modifiée avec succès');
      setIsEditModalOpen(false);
      setEditingClass(null);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification de la classe');
    }
  };

  const handleAssociateTeacher = (classItem: classService.Class) => {
    setAssociatingClass(classItem);
    setSelectedTeacherId(classItem.teacherId || '');
    setIsAssociateModalOpen(true);
  };

  const handleSaveAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associatingClass) return;

    setError(null);
    setSuccess(null);
    try {
      await classService.updateClass(associatingClass.id, {
        teacherId: selectedTeacherId || null,
      });
      setSuccess('Enseignant associé à la classe avec succès');
      setIsAssociateModalOpen(false);
      setAssociatingClass(null);
      setSelectedTeacherId('');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'association de l\'enseignant');
    }
  };

  return (
    <AdminLayout
      title="Gestion des Classes et Matières"
      subtitle="Créer des classes, assigner des enseignants et ajouter des matières"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {loading && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Chargement...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <div className="bg-linear-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-6 py-4 rounded-t-lg mb-4">
            <h2 className="text-lg font-bold text-blue-900 text-center">Créer une nouvelle classe</h2>
          </div>
          <div className="space-y-4 p-6">
            <form onSubmit={handleCreateClass} className="space-y-4">
              <Input
                label="Nom de la classe"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Ex: CM1 A"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                  <select
                    title="Sélectionner un niveau"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner un niveau</option>
                    {levels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enseignant responsable</label>
                  <select
                    title="Sélectionner un enseignant"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <Input
                label="Année scolaire"
                value={newClassYear}
                onChange={(e) => setNewClassYear(e.target.value)}
                placeholder="2024-2025"
                required
              />

              <Button
                type="submit"
                className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 border-none hover:from-yellow-500 hover:to-yellow-500 shadow-lg shadow-yellow-200"
              >
                Créer la classe
              </Button>
            </form>
          </div>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg mb-4">
            <h2 className="text-lg font-bold text-white text-center">Ajouter une matière</h2>
          </div>
          <div className="space-y-4 p-6">
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <Input
                label="Nom de la matière"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
                  <select
                    title="Sélectionner une classe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enseignant</label>
                  <select
                    title="Sélectionner un enseignant"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <Input
                label="Heures par semaine"
                type="number"
                min={1}
                max={20}
                value={newSubjectHours.toString()}
                onChange={(e) => setNewSubjectHours(Number(e.target.value))}
              />

              <Button
                type="submit"
                className="w-full bg-linear-to-r from-blue-600 via-blue-700 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Ajouter la matière
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <section className="space-y-4 mt-8">
        <div>
          <h2 className="text-xl font-semibold text-blue-900">Liste des classes</h2>
          <p className="text-sm text-blue-700/80">Vue d'ensemble des classes disponibles et de leurs responsables.</p>
        </div>
        <div className="grid gap-6">
          {classes.length === 0 ? (
            <Card className="border-dashed border-2 border-blue-200 bg-blue-50/20">
              <p className="text-center text-blue-700 py-12">Aucune classe enregistrée pour le moment.</p>
            </Card>
          ) : (
            classes.map(classItem => {
              const classTeacher = classItem.teacher;
              const classSubjects = subjects.filter(s => s.classId === classItem.id);
              const classSubjectsCount = classSubjects.length;
              return (
                <Card key={classItem.id} className="border-0 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-blue-100 pb-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-900">{classItem.name}</h3>
                      <p className="text-sm text-blue-700/70">Niveau : {classItem.level}</p>
                      {classItem._count && (
                        <p className="text-sm text-blue-700/70 mt-1">
                          {classItem._count.students || 0} élève{classItem._count.students !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {classItem.academicYear}
                    </span>
                  </div>
                  <div className="space-y-3 text-sm text-blue-900">
                    <p>
                      <strong>Enseignant responsable :</strong>{' '}
                      {classTeacher ? (
                        <span>{classTeacher.firstName} {classTeacher.lastName}</span>
                      ) : (
                        <span className="text-yellow-700 font-medium">Non assigné</span>
                      )}
                    </p>
                    <div>
                      <strong>Matières ({classSubjects.length}) :</strong>
                      {classSubjects.length > 0 ? (
                        <ul className="list-disc ml-6 mt-2 space-y-1 text-blue-800">
                          {classSubjects.map(s => {
                            const subjectTeacher = teachers.find(t => t.id === s.teacherId);
                            return (
                              <li key={s.id} className="flex items-center justify-between">
                                <span>{s.name}</span>
                                <span className="text-xs text-blue-600 ml-2">
                                  {subjectTeacher ? `(${subjectTeacher.firstName} ${subjectTeacher.lastName})` : '(Non assigné)'} - {s.hours || 4}h/sem
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-blue-700/70 mt-2 ml-6">Aucune matière assignée</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                        onClick={() => handleAssociateTeacher(classItem)}
                      >
                        {classTeacher ? 'Changer l\'enseignant' : 'Associer un enseignant'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400"
                        onClick={() => handleEdit(classItem)}
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

      <section className="space-y-4 mt-8">
        <div>
          <h2 className="text-xl font-semibold text-blue-900">Matières par classe</h2>
          <p className="text-sm text-blue-700/80">Suivi des matières, enseignants assignés et volume horaire.</p>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="overflow-x-auto">
            {subjects.length === 0 ? (
              <div className="p-12 text-center text-blue-700">
                <p>Aucune matière enregistrée pour le moment.</p>
              </div>
            ) : (
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
                              onClick={() => handleEditSubject(subject)}
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
            )}
          </div>
        </Card>
      </section>

      {/* Modal de modification de classe */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClass(null);
        }}
        title={`Modifier la classe - ${editingClass?.name}`}
        size="lg"
      >
        {editingClass && (
          <form onSubmit={handleUpdateClass} className="space-y-4">
            <Input
              label="Nom de la classe"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
              <select
                title="Sélectionner un niveau"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editForm.level}
                onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                required
              >
                <option value="">Sélectionner un niveau</option>
                {levels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Année scolaire"
              value={editForm.academicYear}
              onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enseignant responsable</label>
              <select
                title="Sélectionner un enseignant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={String(editForm.teacherId)}
                onChange={(e) => setEditForm({ ...editForm, teacherId: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">Aucun enseignant</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingClass(null);
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#fbbf24' }}
              >
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal d'association d'enseignant */}
      <Modal
        isOpen={isAssociateModalOpen}
        onClose={() => {
          setIsAssociateModalOpen(false);
          setAssociatingClass(null);
          setSelectedTeacherId('');
        }}
        title={`Associer un enseignant - ${associatingClass?.name}`}
        size="md"
      >
        {associatingClass && (
          <form onSubmit={handleSaveAssociation} className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Classe :</strong> {associatingClass.name} ({associatingClass.level})
              </p>
              {associatingClass.teacher && (
                <p className="text-sm text-blue-700 mt-1">
                  <strong>Enseignant actuel :</strong> {associatingClass.teacher.firstName} {associatingClass.teacher.lastName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un enseignant</label>
              <select
                title="Sélectionner un enseignant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={String(selectedTeacherId)}
                onChange={(e) => setSelectedTeacherId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Aucun enseignant (retirer l'association)</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                    {t.email && ` (${t.email})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAssociateModalOpen(false);
                  setAssociatingClass(null);
                  setSelectedTeacherId('');
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#fbbf24' }}
              >
                {selectedTeacherId ? 'Associer l\'enseignant' : 'Retirer l\'association'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal de modification de matière */}
      <Modal
        isOpen={isEditSubjectModalOpen}
        onClose={() => {
          setIsEditSubjectModalOpen(false);
          setEditingSubject(null);
          setEditSubjectForm({ teacherId: '', hours: 4 });
        }}
        title={`Modifier la matière - ${editingSubject?.name}`}
        size="md"
      >
        {editingSubject && (
          <form onSubmit={handleUpdateSubject} className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Matière :</strong> {editingSubject.name}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Classe :</strong> {classes.find(c => c.id === editingSubject.classId)?.name || 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enseignant</label>
              <select
                title="Sélectionner un enseignant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={String(editSubjectForm.teacherId)}
                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, teacherId: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">Aucun enseignant</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                    {t.email && ` (${t.email})`}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Heures par semaine"
              type="number"
              min={1}
              max={20}
              value={editSubjectForm.hours.toString()}
              onChange={(e) => setEditSubjectForm({ ...editSubjectForm, hours: Number(e.target.value) })}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditSubjectModalOpen(false);
                  setEditingSubject(null);
                  setEditSubjectForm({ teacherId: '', hours: 4 });
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#fbbf24' }}
              >
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </AdminLayout>
  );
};
