import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";

interface Replacement {
  id: number;
  absentTeacher: string;
  replacementTeacher: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "active" | "completed" | "cancelled";
}

export const Replacements = () => {
  const [replacements, setReplacements] = useState<Replacement[]>([
    {
      id: 1,
      absentTeacher: "Mr. Dupont",
      replacementTeacher: "Mr. Martin",
      startDate: "2025-01-06",
      endDate: "2025-01-10",
      reason: "Maladie",
      status: "active",
    },
    {
      id: 2,
      absentTeacher: "Mme. Bernard",
      replacementTeacher: "Mme. Thomas",
      startDate: "2024-12-20",
      endDate: "2024-12-22",
      reason: "Conges",
      status: "completed",
    },
  ]);
  const [form, setForm] = useState({
    absentTeacher: "",
    replacementTeacher: "",
    startDate: "",
    endDate: "",
    reason: "maladie",
  });
  const [teachers] = useState<string[]>([
    "Mr. Dupont",
    "Mme. Bernard",
    "Mr. Martin",
    "Mme. Thomas",
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/replacements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, status: "active" }),
        }
      );
      if (!response.ok) throw new Error("Erreur lors de la création");
      const newReplacement: Replacement = {
        id: replacements.length + 1,
        ...form,
        status: "active",
      };
      setReplacements([...replacements, newReplacement]);
      setForm({
        absentTeacher: "",
        replacementTeacher: "",
        startDate: "",
        endDate: "",
        reason: "maladie",
      });
      alert("Remplacement créé");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDelete = (id: number) => {
    setReplacements(replacements.filter(r => r.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout
      title="Gestion des remplaçants"
      subtitle="Planifiez les substitutions d’enseignants et suivez leur statut."
    >
      <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="font-semibold text-lg text-blue-900">Nouvelle substitution</h2>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="absent">Enseignant absent</label>
              <select
                id="absent"
                className="form-control"
                value={form.absentTeacher}
                onChange={e => setForm({ ...form, absentTeacher: e.target.value })}
                required
              >
                <option value="">-- Sélectionner --</option>
                {teachers.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="replacement">Remplaçant</label>
              <select
                id="replacement"
                className="form-control"
                value={form.replacementTeacher}
                onChange={e => setForm({ ...form, replacementTeacher: e.target.value })}
                required
              >
                <option value="">-- Sélectionner --</option>
                {teachers.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="start">Date début</label>
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
                <label className="text-sm font-medium text-blue-900" htmlFor="end">Date fin</label>
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
              <label className="text-sm font-medium text-blue-900" htmlFor="reason">Raison</label>
              <select
                id="reason"
                className="form-control"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
              >
                <option value="maladie">Maladie</option>
                <option value="formation">Formation</option>
                <option value="conges">Congés</option>
                <option value="personnel">Raison personnelle</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
              Créer le remplacement
            </Button>
          </form>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-blue-900">Remplacements en cours</h2>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                onClick={() => alert("Exporter les remplacements")}
              >
                Exporter
              </Button>
            </div>
            <div className="divide-y divide-blue-100">
              {replacements.map(r => (
                <div key={r.id} className="py-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-blue-900">
                        {r.absentTeacher} → {r.replacementTeacher}
                      </p>
                      <p className="text-xs text-blue-700/80">
                        {r.startDate} au {r.endDate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700/70 mb-2">Raison : {r.reason}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    onClick={() => handleDelete(r.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
              {replacements.length === 0 && (
                <p className="text-sm text-blue-700/70 text-center py-6">Aucun remplacement enregistré.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
