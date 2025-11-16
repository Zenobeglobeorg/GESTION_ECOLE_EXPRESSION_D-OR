import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [schoolSettings, setSchoolSettings] = useState({
    name: "École Primaire Exemple",
    code: "EPE-2024",
    address: "123 Rue de l'Éducation",
    phone: "01 23 45 67 89",
    email: "contact@ecole.fr",
    director: "Mr. Directeur",
  });
  const [systemSettings, setSystemSettings] = useState({
    timezone: "Europe/Paris",
    language: "fr",
    dateFormat: "DD/MM/YYYY",
  });

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/settings/school`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(schoolSettings),
        }
      );
      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");
      alert("Paramètres mis à jour");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleUpdateSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/settings/system`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(systemSettings),
        }
      );
      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");
      alert("Paramètres système mis à jour");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleBackup = () => {
    alert("Sauvegarde en cours... Téléchargement du fichier");
  };

  const tabs = [
    { id: "general", label: "Général" },
    { id: "academic", label: "Académique" },
    { id: "system", label: "Système" },
    { id: "backup", label: "Sauvegarde" },
  ];

  return (
    <AdminLayout
      title="Paramètres Système"
      subtitle="Configurez les informations de l'établissement, les options académiques et les sauvegardes."
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="outline"
            className={`px-4 py-2 rounded-xl border-2 ${
              activeTab === tab.id
                ? "border-yellow-400 text-blue-900 bg-yellow-100"
                : "border-blue-100 text-blue-700 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "general" && (
        <Card className="border-0 shadow-lg">
          <form onSubmit={handleUpdateSchool} className="p-6 space-y-5">
            <h2 className="font-semibold text-lg text-blue-900">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="school-name">Nom de l&apos;école</label>
                <input
                  id="school-name"
                  className="form-control"
                  value={schoolSettings.name}
                  onChange={e => setSchoolSettings({ ...schoolSettings, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="school-code">Code d&apos;établissement</label>
                <input
                  id="school-code"
                  className="form-control"
                  value={schoolSettings.code}
                  onChange={e => setSchoolSettings({ ...schoolSettings, code: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="school-address">Adresse</label>
              <input
                id="school-address"
                className="form-control"
                value={schoolSettings.address}
                onChange={e => setSchoolSettings({ ...schoolSettings, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="school-phone">Téléphone</label>
                <input
                  id="school-phone"
                  className="form-control"
                  value={schoolSettings.phone}
                  onChange={e => setSchoolSettings({ ...schoolSettings, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="school-email">Email</label>
                <input
                  id="school-email"
                  type="email"
                  className="form-control"
                  value={schoolSettings.email}
                  onChange={e => setSchoolSettings({ ...schoolSettings, email: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="school-director">Directeur</label>
              <input
                id="school-director"
                className="form-control"
                value={schoolSettings.director}
                onChange={e => setSchoolSettings({ ...schoolSettings, director: e.target.value })}
              />
            </div>
            <Button type="submit" className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
              Enregistrer les paramètres
            </Button>
          </form>
        </Card>
      )}

      {activeTab === "academic" && (
        <Card className="border-0 shadow-lg">
          <div className="p-6 space-y-4 text-blue-900">
            <h2 className="font-semibold text-lg">Paramètres académiques</h2>
            <p className="text-sm text-blue-700/80">
              Cette section permettra bientôt de configurer les périodes trimestrielles, le barème des notes
              et les seuils d&apos;alerte d&apos;absences. En attendant, vous pouvez gérer ces éléments depuis les onglets
              &quot;Évaluations&quot; et &quot;Présences&quot;.
            </p>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <h3 className="font-medium text-sm mb-2">À venir</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-blue-700/80">
                <li>Gestion des périodes académiques et des bulletins.</li>
                <li>Définition des coefficients globaux par matière.</li>
                <li>Automatisation des notifications d&apos;absences et retards.</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "system" && (
        <Card className="border-0 shadow-lg">
          <form onSubmit={handleUpdateSystem} className="p-6 space-y-4">
            <h2 className="font-semibold text-lg text-blue-900">Paramètres système</h2>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="timezone">Fuseau horaire</label>
              <select
                id="timezone"
                className="form-control"
                value={systemSettings.timezone}
                onChange={e => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
              >
                <option value="UTC">UTC</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="language">Langue</label>
              <select
                id="language"
                className="form-control"
                value={systemSettings.language}
                onChange={e => setSystemSettings({ ...systemSettings, language: e.target.value })}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="date-format">Format de la date</label>
              <select
                id="date-format"
                className="form-control"
                value={systemSettings.dateFormat}
                onChange={e => setSystemSettings({ ...systemSettings, dateFormat: e.target.value })}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <Button type="submit" className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
              Enregistrer les paramètres système
            </Button>
          </form>
        </Card>
      )}

      {activeTab === "backup" && (
        <Card className="border-0 shadow-lg">
          <div className="p-6 space-y-4">
            <h2 className="font-semibold text-lg text-blue-900">Gestion des sauvegardes</h2>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
              <strong>ℹ</strong> Dernière sauvegarde : 2025-01-02 14:30
            </div>
            <div className="space-y-3">
              <Button onClick={handleBackup} className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                Créer une sauvegarde
              </Button>
              <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400">
                Restaurer une sauvegarde
              </Button>
            </div>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
};
