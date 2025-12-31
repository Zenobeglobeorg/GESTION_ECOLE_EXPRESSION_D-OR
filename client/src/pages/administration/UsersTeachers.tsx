import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ProtectedContent } from "../../components/permissions/ProtectedContent";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import * as userService from "../../services/userService";
import * as classService from "../../services/classService";

interface TeacherWithDetails extends userService.UserWithDate {
  teacherLevel?: 'MATERNELLE' | 'PRE_PRIMAIRE' | 'PRIMAIRE' | null;
  teacherStatus?: 'PERMANENT' | 'CONSULTANT' | 'VACATAIRE' | null;
  employmentStartDate?: string | null;
  employmentEndDate?: string | null;
  classes?: classService.Class[];
}

export const UsersTeachers = () => {
  const [teachersList, setTeachersList] = useState<TeacherWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherWithDetails | null>(null);
  const [filterLevel, setFilterLevel] = useState("");
  
  const levels = [
    { value: "MATERNELLE", label: "Maternelle" },
    { value: "PRE_PRIMAIRE", label: "Pré-primaire" },
    { value: "PRIMAIRE", label: "Primaire" },
  ];

  const statuses = [
    { value: "PERMANENT", label: "Permanent" },
    { value: "CONSULTANT", label: "Consultant" },
    { value: "VACATAIRE", label: "Vacataire" },
  ];

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    teacherLevel: "" as "" | "MATERNELLE" | "PRE_PRIMAIRE" | "PRIMAIRE",
    teacherStatus: "" as "" | "PERMANENT" | "CONSULTANT" | "VACATAIRE",
    employmentStartDate: "",
    employmentEndDate: "",
  });

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await userService.getUsers();
        const teachersData = users.filter(u => u.role === 'TEACHER') as TeacherWithDetails[];
        
        // Charger les classes pour chaque enseignant
        const teachersWithClasses = await Promise.all(
          teachersData.map(async (teacher) => {
            try {
              const classes = await classService.getClasses();
              const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
              return { ...teacher, classes: teacherClasses };
            } catch {
              return { ...teacher, classes: [] };
            }
          })
        );
        
        setTeachersList(teachersWithClasses);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des enseignants';
        setError(errorMessage);
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await userService.createUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: 'TEACHER',
        teacherLevel: form.teacherLevel || undefined,
        teacherStatus: form.teacherStatus || undefined,
        employmentStartDate: form.employmentStartDate || undefined,
        employmentEndDate: form.employmentEndDate || undefined,
      });
      setIsCreateModalOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        teacherLevel: "",
        teacherStatus: "",
        employmentStartDate: "",
        employmentEndDate: "",
      });
      // Recharger la liste
      const users = await userService.getUsers();
      const teachersData = users.filter(u => u.role === 'TEACHER') as TeacherWithDetails[];
      const teachersWithClasses = await Promise.all(
        teachersData.map(async (teacher) => {
          try {
            const classes = await classService.getClasses();
            const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
            return { ...teacher, classes: teacherClasses };
          } catch {
            return { ...teacher, classes: [] };
          }
        })
      );
      setTeachersList(teachersWithClasses);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'enseignant';
      setError(errorMessage);
      console.error('Erreur:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      try {
        setError(null);
        await userService.deleteUser(id);
    setTeachersList(teachersList.filter(t => t.id !== id));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
        setError(errorMessage);
        console.error('Erreur:', err);
      }
    }
  };

  const handleEdit = (teacher: TeacherWithDetails) => {
    setEditingTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    teacherLevel: "" as "" | "MATERNELLE" | "PRE_PRIMAIRE" | "PRIMAIRE",
    teacherStatus: "" as "" | "PERMANENT" | "CONSULTANT" | "VACATAIRE",
    employmentStartDate: "",
    employmentEndDate: "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    try {
      setError(null);
      await userService.updateUser(editingTeacher.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone || undefined,
        teacherLevel: editForm.teacherLevel || undefined,
        teacherStatus: editForm.teacherStatus || undefined,
        employmentStartDate: editForm.employmentStartDate || undefined,
        employmentEndDate: editForm.employmentEndDate || undefined,
      });
      setIsEditModalOpen(false);
      setEditingTeacher(null);
      // Recharger la liste
      const users = await userService.getUsers();
      const teachersData = users.filter(u => u.role === 'TEACHER') as TeacherWithDetails[];
      const teachersWithClasses = await Promise.all(
        teachersData.map(async (teacher) => {
          try {
            const classes = await classService.getClasses();
            const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
            return { ...teacher, classes: teacherClasses };
          } catch {
            return { ...teacher, classes: [] };
          }
        })
      );
      setTeachersList(teachersWithClasses);
      alert('Enseignant modifié avec succès');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de l\'enseignant';
      setError(errorMessage);
      console.error('Erreur:', err);
    }
  };

  const getLevelLabel = (level: string | null | undefined) => {
    if (!level) return '-';
    return levels.find(l => l.value === level)?.label || level;
  };

  const getStatusLabel = (status: string | null | undefined) => {
    if (!status) return '-';
    return statuses.find(s => s.value === status)?.label || status;
  };

  const calculateSeniority = (startDate: string | null | undefined) => {
    if (!startDate) return '-';
    const start = new Date(startDate);
    const now = new Date();
    const years = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));
    return `${years} an${years > 1 ? 's' : ''}`;
  };

  const filteredTeachers = filterLevel
    ? teachersList.filter(t => t.teacherLevel === filterLevel)
    : teachersList;

  const handleRowClick = (teacher: TeacherWithDetails) => {
    setSelectedTeacher(teacher);
    setIsDetailsModalOpen(true);
  };

  return (
    <AdminLayout
      title="Gestion des Enseignants"
      subtitle="Ajoutez ou filtrez les professeurs par niveau."
    >
      <ProtectedContent permission="users.read" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de consulter les enseignants.
        </div>
      }>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <ProtectedContent permission="users.create">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              style={{ backgroundColor: '#fbbf24' }}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvel Enseignant
            </Button>
          </ProtectedContent>
        </div>

      <Card className="border-0 shadow-lg">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="font-semibold text-lg text-blue-900">Liste des enseignants</h2>
                  <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
              className="form-control md:w-64"
            >
              <option value="">Tous les niveaux</option>
              {levels.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des enseignants...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun enseignant trouvé</p>
                </div>
          ) : (
            <div className="overflow-y-auto max-h-96 border border-blue-100 rounded-xl">
              <table className="table">
                <thead className="sticky top-0">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Niveau</th>
                    <th>Statut</th>
                    <th>Ancienneté</th>
                    <th>Classes</th>
                    <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.map(teacher => (
                    <tr 
                      key={teacher.id}
                      className="cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleRowClick(teacher)}
                    >
                      <td className="font-semibold">{teacher.firstName} {teacher.lastName}</td>
                      <td className="text-xs">{teacher.email}</td>
                      <td className="text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {getLevelLabel(teacher.teacherLevel)}
                        </span>
                      </td>
                      <td className="text-xs">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {getStatusLabel(teacher.teacherStatus)}
                        </span>
                      </td>
                      <td className="text-xs">{calculateSeniority(teacher.employmentStartDate)}</td>
                      <td className="text-xs">{teacher.classes?.length || 0}</td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          <ProtectedContent permission="users.update">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                              onClick={() => {
                                setEditForm({
                                  firstName: teacher.firstName,
                                  lastName: teacher.lastName,
                                  phone: teacher.phone || "",
                                  teacherLevel: teacher.teacherLevel || "",
                                  teacherStatus: teacher.teacherStatus || "",
                                  employmentStartDate: teacher.employmentStartDate ? new Date(teacher.employmentStartDate).toISOString().split('T')[0] : "",
                                  employmentEndDate: teacher.employmentEndDate ? new Date(teacher.employmentEndDate).toISOString().split('T')[0] : "",
                                });
                                handleEdit(teacher);
                              }}
                            >
                              Modifier
                            </Button>
                          </ProtectedContent>
                          <ProtectedContent permission="users.delete">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                              onClick={() => handleDelete(teacher.id)}
                            >
                              Supprimer
                            </Button>
                          </ProtectedContent>
                        </div>
                      </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
          )}
        </div>
      </Card>

      {/* Modal de détails */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Détails - ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}`}
        size="lg"
      >
        {selectedTeacher && (
          <div className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-4 py-3 rounded-t-lg mb-4">
                <h3 className="text-blue-900 font-bold text-lg text-center">Informations Personnelles</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Prénom</p>
                  <p className="text-blue-900 font-semibold">{selectedTeacher.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Nom</p>
                  <p className="text-blue-900 font-semibold">{selectedTeacher.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Email</p>
                  <p className="text-blue-900 font-semibold">{selectedTeacher.email}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Téléphone</p>
                  <p className="text-blue-900 font-semibold">{selectedTeacher.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Date de création</p>
                  <p className="text-blue-900 font-semibold">
                    {new Date(selectedTeacher.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations professionnelles */}
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg mb-4">
                <h3 className="text-white font-bold text-lg text-center">Informations Professionnelles</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Niveau</p>
                  <p className="text-blue-900 font-semibold">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {getLevelLabel(selectedTeacher.teacherLevel)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Statut</p>
                  <p className="text-blue-900 font-semibold">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {getStatusLabel(selectedTeacher.teacherStatus)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Date de début</p>
                  <p className="text-blue-900 font-semibold">
                    {selectedTeacher.employmentStartDate
                      ? new Date(selectedTeacher.employmentStartDate).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Date de fin</p>
                  <p className="text-blue-900 font-semibold">
                    {selectedTeacher.employmentEndDate
                      ? new Date(selectedTeacher.employmentEndDate).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-blue-600 font-medium mb-1">Ancienneté</p>
                  <p className="text-blue-900 font-semibold text-lg">
                    {calculateSeniority(selectedTeacher.employmentStartDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Classes assignées */}
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg mb-4">
                <h3 className="text-white font-bold text-lg text-center">
                  Classes Assignées ({selectedTeacher.classes?.length || 0})
                </h3>
              </div>
              {selectedTeacher.classes && selectedTeacher.classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTeacher.classes.map((cls) => (
                    <div key={cls.id} className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-blue-200">
                      <p className="text-blue-900 font-bold">{cls.name}</p>
                      {cls.level && (
                        <p className="text-blue-600 text-sm">{cls.level}</p>
                      )}
                      {cls._count && (
                        <p className="text-blue-700 text-xs mt-1">
                          {cls._count.students || 0} élève{cls._count.students !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-blue-50 rounded-lg">
                  <p className="text-blue-600">Aucune classe assignée</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de modification */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTeacher(null);
          setEditForm({
            firstName: "",
            lastName: "",
            phone: "",
            teacherLevel: "",
            teacherStatus: "",
            employmentStartDate: "",
            employmentEndDate: "",
          });
        }}
        title={`Modifier - ${editingTeacher?.firstName} ${editingTeacher?.lastName}`}
        size="lg"
      >
        {editingTeacher && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
              <Input
                label="Nom"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Téléphone"
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
              <select
                value={editForm.teacherLevel}
                onChange={(e) => setEditForm({ ...editForm, teacherLevel: e.target.value as typeof editForm.teacherLevel })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Sélectionner --</option>
                {levels.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={editForm.teacherStatus}
                onChange={(e) => setEditForm({ ...editForm, teacherStatus: e.target.value as typeof editForm.teacherStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Sélectionner --</option>
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
              <Input
                type="date"
                value={editForm.employmentStartDate}
                onChange={(e) => setEditForm({ ...editForm, employmentStartDate: e.target.value })}
                required
              />
            </div>

            {(editForm.teacherStatus === 'CONSULTANT' || editForm.teacherStatus === 'VACATAIRE') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <Input
                  type="date"
                  value={editForm.employmentEndDate}
                  onChange={(e) => setEditForm({ ...editForm, employmentEndDate: e.target.value })}
                  required={editForm.teacherStatus === 'CONSULTANT' || editForm.teacherStatus === 'VACATAIRE'}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTeacher(null);
                  setEditForm({
                    firstName: "",
                    lastName: "",
                    phone: "",
                    teacherLevel: "",
                    teacherStatus: "",
                    employmentStartDate: "",
                    employmentEndDate: "",
                  });
                }}
              >
                Annuler
              </Button>
              <ProtectedContent permission="users.update">
                <Button
                  type="submit"
                  style={{ backgroundColor: '#fbbf24' }}
                >
                  Enregistrer les modifications
                </Button>
              </ProtectedContent>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal de création */}
      <ProtectedContent permission="users.create">
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Créer un Nouvel Enseignant"
          size="lg"
        >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Input
              label="Nom"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <Input
            label="Téléphone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
            <select
              value={form.teacherLevel}
              onChange={(e) => setForm({ ...form, teacherLevel: e.target.value as typeof form.teacherLevel })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Sélectionner --</option>
              {levels.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={form.teacherStatus}
              onChange={(e) => setForm({ ...form, teacherStatus: e.target.value as typeof form.teacherStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Sélectionner --</option>
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <Input
              type="date"
              value={form.employmentStartDate}
              onChange={(e) => setForm({ ...form, employmentStartDate: e.target.value })}
              required
            />
          </div>

          {(form.teacherStatus === 'CONSULTANT' || form.teacherStatus === 'VACATAIRE') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
              <Input
                type="date"
                value={form.employmentEndDate}
                onChange={(e) => setForm({ ...form, employmentEndDate: e.target.value })}
                required={form.teacherStatus === 'CONSULTANT' || form.teacherStatus === 'VACATAIRE'}
              />
        </div>
          )}

          <Input
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            helperText="Minimum 8 caractères"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Annuler
            </Button>
            <ProtectedContent permission="users.create">
              <Button
                type="submit"
                style={{ backgroundColor: '#fbbf24' }}
              >
                Créer le Compte
              </Button>
            </ProtectedContent>
          </div>
        </form>
      </Modal>
      </ProtectedContent>
      </ProtectedContent>
    </AdminLayout>
  );
};
