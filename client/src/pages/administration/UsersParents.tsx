import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ProtectedContent } from "../../components/permissions/ProtectedContent";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import * as userService from "../../services/userService";
import * as studentService from "../../services/studentService";

interface ParentWithStudents extends userService.UserWithDate {
  students?: studentService.Student[];
}

export const UsersParents = () => {
  const [parents, setParents] = useState<ParentWithStudents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentWithStudents | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentWithStudents | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    const loadParents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await userService.getUsers();
        const parentsData = users.filter(u => u.role === 'PARENT');
        
        // Charger les élèves pour chaque parent
        const parentsWithStudents = await Promise.all(
          parentsData.map(async (parent) => {
            try {
              const students = await studentService.getStudents();
              const parentStudents = students.filter(s => s.parentId === parent.id);
              return { ...parent, students: parentStudents };
            } catch {
              return { ...parent, students: [] };
            }
          })
        );
        
        setParents(parentsWithStudents);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des parents';
        setError(errorMessage);
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadParents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await userService.createUser({
        ...form,
        role: 'PARENT',
      });
      setIsCreateModalOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
      });
      // Recharger la liste
      const users = await userService.getUsers();
      const parentsData = users.filter(u => u.role === 'PARENT');
      const parentsWithStudents = await Promise.all(
        parentsData.map(async (parent) => {
          try {
            const students = await studentService.getStudents();
            const parentStudents = students.filter(s => s.parentId === parent.id);
            return { ...parent, students: parentStudents };
          } catch {
            return { ...parent, students: [] };
          }
        })
      );
      setParents(parentsWithStudents);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du parent';
      setError(errorMessage);
      console.error('Erreur:', err);
    }
  };

  const handleDelete = async (parent: ParentWithStudents) => {
    const childrenCount = parent.students?.length || 0;
    
    // Si le parent a des enfants, proposer le choix
    if (childrenCount > 0) {
      const choice = window.confirm(
        `Ce parent a ${childrenCount} enfant(s) associé(s).\n\n` +
        `Cliquez sur "OK" pour supprimer le parent ET ses enfants.\n` +
        `Cliquez sur "Annuler" pour supprimer seulement le parent (les enfants seront réassignés au parent système et pourront être réassociés plus tard).`
      );
      
      if (choice) {
        // Supprimer avec les enfants
        if (window.confirm(`⚠️ ATTENTION : Cette action est irréversible !\n\nVous allez supprimer le parent "${parent.firstName} ${parent.lastName}" et ses ${childrenCount} enfant(s).\n\nÊtes-vous absolument sûr ?`)) {
          try {
            setError(null);
            const result = await userService.deleteUser(parent.id, true);
            setParents(parents.filter(p => p.id !== parent.id));
            alert(result.message || `Parent et ${childrenCount} enfant(s) supprimé(s) avec succès`);
            // Recharger la liste
            const users = await userService.getUsers();
            const parentsData = users.filter(u => u.role === 'PARENT');
            const parentsWithStudents = await Promise.all(
              parentsData.map(async (p) => {
                try {
                  const students = await studentService.getStudents();
                  const parentStudents = students.filter(s => s.parentId === p.id);
                  return { ...p, students: parentStudents };
                } catch {
                  return { ...p, students: [] };
                }
              })
            );
            setParents(parentsWithStudents);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
            setError(errorMessage);
            console.error('Erreur:', err);
          }
        }
      } else {
        // Supprimer seulement le parent (désassocier les enfants)
        if (window.confirm(`Supprimer le parent "${parent.firstName} ${parent.lastName}" ?\n\nLes ${childrenCount} enfant(s) seront réassignés au parent système et pourront être réassociés à un nouveau parent depuis la page d'association.`)) {
          try {
            setError(null);
            const result = await userService.deleteUser(parent.id, false);
            setParents(parents.filter(p => p.id !== parent.id));
            alert(result.message || `Parent supprimé avec succès. ${childrenCount} enfant(s) désassocié(s).`);
            // Recharger la liste
            const users = await userService.getUsers();
            const parentsData = users.filter(u => u.role === 'PARENT');
            const parentsWithStudents = await Promise.all(
              parentsData.map(async (p) => {
                try {
                  const students = await studentService.getStudents();
                  const parentStudents = students.filter(s => s.parentId === p.id);
                  return { ...p, students: parentStudents };
                } catch {
                  return { ...p, students: [] };
                }
              })
            );
            setParents(parentsWithStudents);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
            setError(errorMessage);
            console.error('Erreur:', err);
          }
        }
      }
    } else {
      // Pas d'enfants, suppression simple
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer le parent "${parent.firstName} ${parent.lastName}" ?`)) {
        try {
          setError(null);
          await userService.deleteUser(parent.id);
          setParents(parents.filter(p => p.id !== parent.id));
          alert('Parent supprimé avec succès');
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
          setError(errorMessage);
          console.error('Erreur:', err);
        }
      }
    }
  };

  const handleEdit = (parent: ParentWithStudents) => {
    setEditingParent(parent);
    setIsEditModalOpen(true);
  };

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParent) return;

    try {
      setError(null);
      await userService.updateUser(editingParent.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone || undefined,
      });
      setIsEditModalOpen(false);
      setEditingParent(null);
      // Recharger la liste
      const users = await userService.getUsers();
      const parentsData = users.filter(u => u.role === 'PARENT');
      const parentsWithStudents = await Promise.all(
        parentsData.map(async (parent) => {
          try {
            const students = await studentService.getStudents();
            const parentStudents = students.filter(s => s.parentId === parent.id);
            return { ...parent, students: parentStudents };
          } catch {
            return { ...parent, students: [] };
          }
        })
      );
      setParents(parentsWithStudents);
      alert('Parent modifié avec succès');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du parent';
      setError(errorMessage);
      console.error('Erreur:', err);
    }
  };

  const filteredParents = parents.filter(
    p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(filterName.toLowerCase()) ||
      p.email.toLowerCase().includes(filterName.toLowerCase())
  );

  const handleRowClick = (parent: ParentWithStudents) => {
    setSelectedParent(parent);
    setIsDetailsModalOpen(true);
  };

  return (
    <AdminLayout
      title="Gestion des Parents"
      subtitle="Créez des comptes familles et maintenez leurs informations à jour."
    >
      <ProtectedContent permission="users.read" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de consulter les parents.
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
              Nouveau Parent
            </Button>
          </ProtectedContent>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="border-0 shadow-lg lg:col-span-3">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="font-semibold text-lg text-blue-900">Liste des parents</h2>
              <input
                type="text"
                placeholder="Filtrer par nom ou email..."
                className="form-control md:w-64"
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des parents...</p>
              </div>
            ) : filteredParents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun parent trouvé</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96 border border-blue-100 rounded-xl">
                <table className="table">
                  <thead className="sticky top-0">
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Enfants</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.map(parent => (
                      <tr 
                        key={parent.id}
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleRowClick(parent)}
                      >
                        <td className="font-semibold">{parent.firstName} {parent.lastName}</td>
                        <td className="text-xs">{parent.email}</td>
                        <td className="text-xs">{parent.phone || '-'}</td>
                        <td className="text-xs">{parent.students?.length || 0}</td>
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
                                    firstName: parent.firstName,
                                    lastName: parent.lastName,
                                    email: parent.email,
                                    phone: parent.phone || "",
                                  });
                                  handleEdit(parent);
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
                                onClick={() => handleDelete(parent)}
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
      </div>

      {/* Modal de détails */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Détails - ${selectedParent?.firstName} ${selectedParent?.lastName}`}
        size="lg"
      >
        {selectedParent && (
          <div className="space-y-6">
            {/* Informations du parent */}
            <div>
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-4 py-3 rounded-t-lg mb-4">
                <h3 className="text-blue-900 font-bold text-lg text-center">Informations du Parent</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Prénom</p>
                  <p className="text-blue-900 font-semibold">{selectedParent.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Nom</p>
                  <p className="text-blue-900 font-semibold">{selectedParent.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Email</p>
                  <p className="text-blue-900 font-semibold">{selectedParent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Téléphone</p>
                  <p className="text-blue-900 font-semibold">{selectedParent.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Date de création</p>
                  <p className="text-blue-900 font-semibold">
                    {new Date(selectedParent.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations des enfants */}
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg mb-4">
                <h3 className="text-white font-bold text-lg text-center">
                  Enfants ({selectedParent.students?.length || 0})
                </h3>
              </div>
              {selectedParent.students && selectedParent.students.length > 0 ? (
                <div className="space-y-3">
                  {selectedParent.students.map((student) => (
                    <div key={student.id} className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-blue-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-blue-900 font-bold text-lg mb-1">
                            {student.firstName} {student.lastName}
                          </h4>
                          <div className="flex gap-2 mb-2">
                            {student.hasDisability && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                Handicap
                              </span>
                            )}
                            {student.isOrphan && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                Orphelin {student.orphanType ? `(${student.orphanType})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        {student.class && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                            {student.class.name}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-blue-600 font-medium mb-1">Date de naissance</p>
                          <p className="text-blue-900">
                            {new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-medium mb-1">Date d'inscription</p>
                          <p className="text-blue-900">
                            {new Date(student.enrollmentDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        {student.schoolOfOrigin && (
                          <div className="col-span-2">
                            <p className="text-blue-600 font-medium mb-1">École de provenance</p>
                            <p className="text-blue-900">{student.schoolOfOrigin}</p>
                          </div>
                        )}
                        {student.fatherName && (
                          <div>
                            <p className="text-blue-600 font-medium mb-1">Père</p>
                            <p className="text-blue-900">{student.fatherName}</p>
                            {student.fatherContact && (
                              <p className="text-blue-700 text-xs">{student.fatherContact}</p>
                            )}
                          </div>
                        )}
                        {student.motherName && (
                          <div>
                            <p className="text-blue-600 font-medium mb-1">Mère</p>
                            <p className="text-blue-900">{student.motherName}</p>
                            {student.motherContact && (
                              <p className="text-blue-700 text-xs">{student.motherContact}</p>
                            )}
                          </div>
                        )}
                        {student.guardianName && (
                          <div className="col-span-2">
                            <p className="text-blue-600 font-medium mb-1">Tuteur/Tutrice</p>
                            <p className="text-blue-900">{student.guardianName}</p>
                            {student.guardianContact && (
                              <p className="text-blue-700 text-xs">{student.guardianContact}</p>
                            )}
                          </div>
                        )}
                        <div>
                          <p className="text-blue-600 font-medium mb-1">Option de paiement</p>
                          <p className="text-blue-900">
                            {student.paymentOption === 'MONTHLY' && 'Mensuel'}
                            {student.paymentOption === 'QUARTERLY' && 'Trimestriel'}
                            {student.paymentOption === 'ANNUAL' && 'Annuel'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-blue-50 rounded-lg">
                  <p className="text-blue-600">Aucun enfant inscrit</p>
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
          setEditingParent(null);
          setEditForm({ firstName: "", lastName: "", email: "", phone: "" });
        }}
        title={`Modifier - ${editingParent?.firstName} ${editingParent?.lastName}`}
        size="lg"
      >
        {editingParent && (
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
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              disabled
              helperText="L'email ne peut pas être modifié"
            />

            <Input
              label="Téléphone"
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingParent(null);
                  setEditForm({ firstName: "", lastName: "", email: "", phone: "" });
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
          title="Créer un Nouveau Parent"
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
