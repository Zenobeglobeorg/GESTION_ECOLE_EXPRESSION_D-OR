import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { ProtectedContent } from "../../components/permissions/ProtectedContent";
import * as userService from "../../services/userService";

export const UsersAdmins = () => {
  const [admins, setAdmins] = useState<userService.UserWithDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<userService.UserWithDate | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<userService.UserWithDate | null>(null);
  const [filterName, setFilterName] = useState("");
  const [sortBy, setSortBy] = useState<'alphabetical' | 'creation'>('creation');

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    function: "",
    twoFactorEnabled: true, // Règle métier : activé par défaut pour les Administrateurs
  });

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await userService.getUsers();
        const adminsData = users.filter(u => u.role === 'ADMINISTRATION');
        setAdmins(adminsData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des administrateurs';
        setError(errorMessage);
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await userService.createUser({
        ...form,
        role: 'ADMINISTRATION',
        function: form.function || undefined,
        twoFactorEnabled: form.twoFactorEnabled,
      });
      setIsCreateModalOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        function: "",
        twoFactorEnabled: true,
      });
      // Recharger la liste
      const users = await userService.getUsers();
      const adminsData = users.filter(u => u.role === 'ADMINISTRATION');
      setAdmins(adminsData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'administrateur';
      setError(errorMessage);
      console.error('Erreur:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      try {
        setError(null);
        await userService.deleteUser(id);
        setAdmins(admins.filter(a => a.id !== id));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
        setError(errorMessage);
        console.error('Erreur:', err);
      }
    }
  };

  const handleEdit = (admin: userService.UserWithDate) => {
    setEditingAdmin(admin);
    setIsEditModalOpen(true);
  };

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    function: "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    try {
      setError(null);
      await userService.updateUser(editingAdmin.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone || undefined,
        function: editForm.function || undefined,
      });
      setIsEditModalOpen(false);
      setEditingAdmin(null);
      // Recharger la liste
      const users = await userService.getUsers();
      const adminsData = users.filter(u => u.role === 'ADMINISTRATION');
      setAdmins(adminsData);
      alert('Administrateur modifié avec succès');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de l\'administrateur';
      setError(errorMessage);
      console.error('Erreur:', err);
    }
  };

  const filteredAdmins = admins.filter(
    a =>
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(filterName.toLowerCase()) ||
      a.email.toLowerCase().includes(filterName.toLowerCase())
  );

  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleRowClick = (admin: userService.UserWithDate) => {
    setSelectedAdmin(admin);
    setIsDetailsModalOpen(true);
  };

  return (
    <AdminLayout
      title="Gestion des Administrateurs"
      subtitle="Créez et gérez les comptes administrateurs."
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <ProtectedContent permission="users.read" fallback={
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
          Vous n'avez pas la permission de consulter les administrateurs.
        </div>
      }>
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
              Nouvel Administrateur
            </Button>
          </ProtectedContent>
        </div>

        <Card className="border-0 shadow-lg">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="font-semibold text-lg text-blue-900">Liste des administrateurs</h2>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'alphabetical' | 'creation')}
                className="form-control md:w-48"
              >
                <option value="alphabetical">Trier par ordre alphabétique</option>
                <option value="creation">Trier par date de création</option>
              </select>
              <input
                type="text"
                placeholder="Filtrer par nom ou email..."
                className="form-control md:w-64"
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des administrateurs...</p>
            </div>
          ) : sortedAdmins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun administrateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96 border border-blue-100 rounded-xl">
              <table className="table">
                <thead className="sticky top-0">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Date de création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAdmins.map(admin => (
                    <tr 
                      key={admin.id}
                      className="cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleRowClick(admin)}
                    >
                      <td className="font-semibold">
                        <div>{admin.firstName} {admin.lastName}</div>
                        {admin.function && (
                          <div className="text-xs text-blue-600 font-medium mt-0.5">{admin.function}</div>
                        )}
                      </td>
                      <td className="text-xs">{admin.email}</td>
                      <td className="text-xs">{admin.phone || '-'}</td>
                      <td className="text-xs">{new Date(admin.createdAt).toLocaleDateString('fr-FR')}</td>
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
                                  firstName: admin.firstName,
                                  lastName: admin.lastName,
                                  phone: admin.phone || "",
                                  function: admin.function || "",
                                });
                                handleEdit(admin);
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
                              onClick={() => handleDelete(admin.id)}
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
        title={`Détails - ${selectedAdmin?.firstName} ${selectedAdmin?.lastName}`}
        size="lg"
      >
        {selectedAdmin && (
          <div className="space-y-6">
            <div>
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-4 py-3 rounded-t-lg mb-4">
                <h3 className="text-blue-900 font-bold text-lg text-center">Informations de l'Administrateur</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Prénom</p>
                  <p className="text-blue-900 font-semibold">{selectedAdmin.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Nom</p>
                  <p className="text-blue-900 font-semibold">{selectedAdmin.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Email</p>
                  <p className="text-blue-900 font-semibold">{selectedAdmin.email}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Téléphone</p>
                  <p className="text-blue-900 font-semibold">{selectedAdmin.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Rôle</p>
                  <p className="text-blue-900 font-semibold">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Administrateur
                    </span>
                  </p>
                </div>
                {selectedAdmin.function && (
                  <div>
                    <p className="text-sm text-blue-600 font-medium mb-1">Fonction</p>
                    <p className="text-blue-900 font-semibold">{selectedAdmin.function}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Date de création</p>
                  <p className="text-blue-900 font-semibold">
                    {new Date(selectedAdmin.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
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
          setEditingAdmin(null);
          setEditForm({ firstName: "", lastName: "", phone: "", function: "" });
        }}
        title={`Modifier - ${editingAdmin?.firstName} ${editingAdmin?.lastName}`}
        size="lg"
      >
        {editingAdmin && (
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
              value={editingAdmin.email}
              disabled
              helperText="L'email ne peut pas être modifié"
            />

            <Input
              label="Téléphone"
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />

            <Input
              label="Fonction"
              value={editForm.function}
              onChange={(e) => setEditForm({ ...editForm, function: e.target.value })}
              placeholder="Ex: Directeur, Fondateur, Secrétaire, etc."
              helperText="Fonction de l'administrateur dans l'établissement"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAdmin(null);
                  setEditForm({ firstName: "", lastName: "", phone: "", function: "" });
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

      {/* Modal de création */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer un Nouvel Administrateur"
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
            label="Fonction"
            value={form.function}
            onChange={(e) => setForm({ ...form, function: e.target.value })}
            placeholder="Ex: Directeur, Fondateur, Secrétaire, etc."
            helperText="Fonction de l'administrateur dans l'établissement"
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="create-admin-twoFactorEnabled"
              checked={form.twoFactorEnabled}
              onChange={(e) => setForm({ ...form, twoFactorEnabled: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="create-admin-twoFactorEnabled" className="text-sm font-medium text-gray-700">
              Activer la double authentification (2FA) à la création
            </label>
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            L&apos;administrateur pourra modifier ce réglage plus tard dans Paramètres.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: '#fbbf24' }}
            >
              Créer le Compte
            </Button>
          </div>
        </form>
      </Modal>
      </ProtectedContent>
    </AdminLayout>
  );
};

