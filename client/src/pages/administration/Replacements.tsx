import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ProtectedContent } from "../../components/permissions/ProtectedContent";
import * as replacementService from "../../services/replacementService";
import * as userService from "../../services/userService";

export const Replacements = () => {
  const [replacements, setReplacements] = useState<replacementService.Replacement[]>([]);
  const [teachers, setTeachers] = useState<userService.UserWithDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Form state
  const [form, setForm] = useState({
    absentTeacherId: "" as number | "",
    replacementTeacherId: "" as number | "",
    startDate: "",
    endDate: "",
    reason: "MALADIE" as "MALADIE" | "FORMATION" | "CONGES" | "PERSONNEL" | "AUTRE",
    notes: "",
  });

  // Edit state
  const [editingReplacement, setEditingReplacement] = useState<replacementService.Replacement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    absentTeacherId: "" as number | "",
    replacementTeacherId: "" as number | "",
    startDate: "",
    endDate: "",
    reason: "MALADIE" as "MALADIE" | "FORMATION" | "CONGES" | "PERSONNEL" | "AUTRE",
    notes: "",
    status: "ACTIVE" as "ACTIVE" | "COMPLETED" | "CANCELLED",
  });

  const reasons = [
    { value: "MALADIE", label: "Maladie" },
    { value: "FORMATION", label: "Formation" },
    { value: "CONGES", label: "Congés" },
    { value: "PERSONNEL", label: "Raison personnelle" },
    { value: "AUTRE", label: "Autre" },
  ];

  const statuses = [
    { value: "ACTIVE", label: "En cours" },
    { value: "COMPLETED", label: "Terminé" },
    { value: "CANCELLED", label: "Annulé" },
  ];

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [replacementsData, users] = await Promise.all([
        replacementService.getReplacements(filterStatus || undefined),
        userService.getUsers(),
      ]);
      setReplacements(replacementsData);
      setTeachers(users.filter(u => u.role === 'TEACHER'));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.absentTeacherId || !form.replacementTeacherId) {
      setError('Veuillez sélectionner les deux enseignants');
      return;
    }

    if (form.absentTeacherId === form.replacementTeacherId) {
      setError('L\'enseignant absent et le remplaçant ne peuvent pas être la même personne');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await replacementService.createReplacement({
        absentTeacherId: form.absentTeacherId,
        replacementTeacherId: form.replacementTeacherId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        notes: form.notes || undefined,
      });

      setSuccess('Remplacement créé avec succès');
      setForm({
        absentTeacherId: "",
        replacementTeacherId: "",
        startDate: "",
        endDate: "",
        reason: "MALADIE",
        notes: "",
      });
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du remplacement';
      setError(errorMessage);
      console.error('Error creating replacement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (replacement: replacementService.Replacement) => {
    setEditingReplacement(replacement);
    setEditForm({
      absentTeacherId: replacement.absentTeacherId,
      replacementTeacherId: replacement.replacementTeacherId,
      startDate: new Date(replacement.startDate).toISOString().split('T')[0],
      endDate: new Date(replacement.endDate).toISOString().split('T')[0],
      reason: replacement.reason,
      notes: replacement.notes || "",
      status: replacement.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReplacement) return;

    if (editForm.absentTeacherId === editForm.replacementTeacherId) {
      setError('L\'enseignant absent et le remplaçant ne peuvent pas être la même personne');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await replacementService.updateReplacement(editingReplacement.id, {
        absentTeacherId: editForm.absentTeacherId,
        replacementTeacherId: editForm.replacementTeacherId,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        reason: editForm.reason,
        notes: editForm.notes || null,
        status: editForm.status,
      });

      setSuccess('Remplacement modifié avec succès');
      setIsEditModalOpen(false);
      setEditingReplacement(null);
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du remplacement';
      setError(errorMessage);
      console.error('Error updating replacement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce remplacement ?')) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await replacementService.deleteReplacement(id);
      setSuccess('Remplacement supprimé avec succès');
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Error deleting replacement:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonLabel = (reason: string) => {
    return reasons.find(r => r.value === reason)?.label || reason;
  };

  const getStatusLabel = (status: string) => {
    return statuses.find(s => s.value === status)?.label || status;
  };

  const filteredReplacements = replacements;

  return (
    <AdminLayout
      title="Gestion des remplaçants"
      subtitle="Planifiez les substitutions d'enseignants et suivez leur statut."
    >
      <ProtectedContent permission="schedule.manage" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de gérer les remplacements.
        </div>
      }>
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

        <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProtectedContent permission="schedule.manage">
            <Card className="border-0 shadow-lg">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-6 py-4 rounded-t-lg mb-4">
                <h2 className="font-semibold text-lg text-blue-900 text-center">Nouvelle substitution</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="absent">
                Enseignant absent
              </label>
              <select
                title="Sélectionner l'enseignant absent"
                id="absent"
                className="form-control"
                value={String(form.absentTeacherId)}
                onChange={e => setForm({ ...form, absentTeacherId: e.target.value ? Number(e.target.value) : "" })}
                required
              >
                <option value="">-- Sélectionner --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="replacement">
                Remplaçant
              </label>
              <select
                title="Sélectionner le remplaçant"
                id="replacement"
                className="form-control"
                value={String(form.replacementTeacherId)}
                onChange={e => setForm({ ...form, replacementTeacherId: e.target.value ? Number(e.target.value) : "" })}
                required
              >
                <option value="">-- Sélectionner --</option>
                {teachers
                  .filter(t => t.id !== form.absentTeacherId)
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="start">
                  Date début
                </label>
                <input
                  id="start"
                  type="date"
                  className="form-control"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="end">
                  Date fin
                </label>
                <input
                  id="end"
                  type="date"
                  className="form-control"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="reason">
                Raison
              </label>
              <select
                title="Sélectionner la raison"
                id="reason"
                className="form-control"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value as typeof form.reason })}
                required
              >
                {reasons.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="notes">
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                className="form-control"
                rows={2}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Informations supplémentaires..."
              />
            </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                >
                  {loading ? 'Création...' : 'Créer le remplacement'}
                </Button>
              </form>
            </Card>
          </ProtectedContent>

        <Card className="border-0 shadow-lg">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-blue-900">Remplacements</h2>
              <select
                title="Filtrer par statut"
                className="form-control text-sm"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : (
              <div className="divide-y divide-blue-100 max-h-[600px] overflow-y-auto">
                {filteredReplacements.length === 0 ? (
                  <p className="text-sm text-blue-700/70 text-center py-6">Aucun remplacement enregistré.</p>
                ) : (
                  filteredReplacements.map(r => (
                    <div key={r.id} className="py-3 hover:bg-blue-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">
                            {r.absentTeacher?.firstName} {r.absentTeacher?.lastName} → {r.replacementTeacher?.firstName} {r.replacementTeacher?.lastName}
                          </p>
                          <p className="text-xs text-blue-700/80 mt-1">
                            {new Date(r.startDate).toLocaleDateString('fr-FR')} au {new Date(r.endDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(r.status)}`}>
                          {getStatusLabel(r.status)}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700/70 mb-2">
                        Raison : {getReasonLabel(r.reason)}
                      </p>
                      {r.notes && (
                        <p className="text-xs text-blue-600/70 mb-2 italic">
                          Note : {r.notes}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <ProtectedContent permission="schedule.manage">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                            onClick={() => handleEdit(r)}
                          >
                            Modifier
                          </Button>
                        </ProtectedContent>
                        <ProtectedContent permission="schedule.manage">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                            onClick={() => handleDelete(r.id)}
                          >
                            Supprimer
                          </Button>
                        </ProtectedContent>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal de modification */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingReplacement(null);
        }}
        title="Modifier le remplacement"
        size="lg"
      >
        {editingReplacement && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Enseignant absent</label>
              <select
                title="Sélectionner l'enseignant absent"
                className="form-control"
                value={String(editForm.absentTeacherId)}
                onChange={e => setEditForm({ ...editForm, absentTeacherId: e.target.value ? Number(e.target.value) : "" })}
                required
              >
                <option value="">-- Sélectionner --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Remplaçant</label>
              <select
                title="Sélectionner le remplaçant"
                className="form-control"
                value={String(editForm.replacementTeacherId)}
                onChange={e => setEditForm({ ...editForm, replacementTeacherId: e.target.value ? Number(e.target.value) : "" })}
                required
              >
                <option value="">-- Sélectionner --</option>
                {teachers
                  .filter(t => t.id !== editForm.absentTeacherId)
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date début</label>
                <Input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date fin</label>
                <Input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Raison</label>
              <select
                title="Sélectionner la raison"
                className="form-control"
                value={editForm.reason}
                onChange={e => setEditForm({ ...editForm, reason: e.target.value as typeof editForm.reason })}
                required
              >
                {reasons.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
              <select
                title="Sélectionner le statut"
                className="form-control"
                value={editForm.status}
                onChange={e => setEditForm({ ...editForm, status: e.target.value as typeof editForm.status })}
                required
              >
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Notes (optionnel)</label>
              <textarea
                className="form-control"
                rows={2}
                value={editForm.notes}
                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Informations supplémentaires..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingReplacement(null);
                }}
              >
                Annuler
              </Button>
              <ProtectedContent permission="schedule.manage">
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#fbbf24' }}
                >
                  {loading ? 'Modification...' : 'Enregistrer les modifications'}
                </Button>
              </ProtectedContent>
            </div>
          </form>
        )}
      </Modal>
      </ProtectedContent>
    </AdminLayout>
  );
};
