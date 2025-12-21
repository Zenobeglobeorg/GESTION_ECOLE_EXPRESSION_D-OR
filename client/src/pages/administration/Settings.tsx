import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";
import * as settingsService from "../../services/settingsService";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // School settings
  const [schoolSettings, setSchoolSettings] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    director: "",
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    timezone: "Europe/Paris",
    language: "fr",
    dateFormat: "DD/MM/YYYY",
  });

  // 2FA state
  const [twoFactorStatus, setTwoFactorStatus] = useState<settingsService.TwoFactorStatus>({
    enabled: false,
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [waitingForCode, setWaitingForCode] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [schoolData, systemData, twoFactorData] = await Promise.all([
        settingsService.getSchoolSettings(),
        settingsService.getSystemSettings(),
        settingsService.getTwoFactorStatus().catch(() => ({ enabled: false, configured: false })),
      ]);

      setSchoolSettings({
        name: schoolData.name || "",
        code: schoolData.code || "",
        address: schoolData.address || "",
        phone: schoolData.phone || "",
        email: schoolData.email || "",
        director: schoolData.director || "",
      });

      setSystemSettings({
        timezone: systemData.timezone || "Europe/Paris",
        language: systemData.language || "fr",
        dateFormat: systemData.dateFormat || "DD/MM/YYYY",
      });

      setTwoFactorStatus(twoFactorData);
    } catch (err) {
      console.error("Error loading settings:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await settingsService.updateSchoolSettings(schoolSettings);
      setSuccess("Paramètres de l'école mis à jour avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await settingsService.updateSystemSettings(systemSettings);
      setSuccess("Paramètres système mis à jour avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      setTwoFactorLoading(true);
      setError(null);
      setSuccess(null);
      const result = await settingsService.enableTwoFactor();
      setWaitingForCode(true);
      setVerificationCode("");
      setSuccess(
        result.emailSent
          ? "Code de vérification envoyé par email. Vérifiez votre boîte de réception."
          : "Code de vérification généré. Vérifiez votre email ou la console (mode développement)."
      );
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi du code");
      setTimeout(() => setError(null), 5000);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Veuillez entrer un code de vérification à 6 chiffres");
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setTwoFactorLoading(true);
      setError(null);
      await settingsService.verifyAndEnableTwoFactor(verificationCode);
      setTwoFactorStatus({ enabled: true });
      setWaitingForCode(false);
      setVerificationCode("");
      setSuccess("Double authentification activée avec succès !");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la vérification du code");
      setTimeout(() => setError(null), 5000);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver la double authentification ?")) {
      return;
    }

    try {
      setTwoFactorLoading(true);
      setError(null);
      await settingsService.disableTwoFactor(""); // Le backend vérifie l'authentification
      setTwoFactorStatus({ enabled: false });
      setWaitingForCode(false);
      setVerificationCode("");
      setSuccess("Double authentification désactivée avec succès");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la désactivation de la 2FA");
      setTimeout(() => setError(null), 5000);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleBackup = () => {
    alert("Fonctionnalité de sauvegarde à implémenter");
  };

  const tabs = [
    { id: "general", label: "Général" },
    { id: "academic", label: "Académique" },
    { id: "system", label: "Système" },
    { id: "security", label: "Sécurité" },
    { id: "backup", label: "Sauvegarde" },
  ];

  if (loading) {
    return (
      <AdminLayout title="Paramètres Système" subtitle="Configurez les informations de l'établissement.">
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600">Chargement...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Paramètres Système"
      subtitle="Configurez les informations de l'établissement, les options académiques et les sauvegardes."
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <Button
                key={tab.id}
            variant="outline"
            className={`px-4 py-2 rounded-xl border-2 ${
                  activeTab === tab.id
                ? "border-yellow-400 text-blue-900 dark:text-blue-400 bg-yellow-100 dark:bg-yellow-900/30"
                : "border-blue-100 dark:border-gray-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
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
            <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="school-name">
                  Nom de l&apos;école
                </label>
                    <input
                  id="school-name"
                      className="form-control"
                      value={schoolSettings.name}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, name: e.target.value })}
                  required
                    />
                  </div>
                  <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="school-code">
                  Code d&apos;établissement
                </label>
                    <input
                  id="school-code"
                      className="form-control"
                      value={schoolSettings.code}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, code: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="school-address">
                Adresse
              </label>
                  <input
                id="school-address"
                    className="form-control"
                    value={schoolSettings.address}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, address: e.target.value })}
                  />
                </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="school-phone">
                  Téléphone
                </label>
                    <input
                  id="school-phone"
                      className="form-control"
                      value={schoolSettings.phone}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="school-email">
                  Email
                </label>
                    <input
                  id="school-email"
                      type="email"
                      className="form-control"
                      value={schoolSettings.email}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="school-director">
                Directeur
              </label>
                  <input
                id="school-director"
                    className="form-control"
                    value={schoolSettings.director}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, director: e.target.value })}
                  />
                </div>
            <Button
              type="submit"
              className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
            >
              Enregistrer les paramètres
            </Button>
              </form>
            </Card>
          )}

      {activeTab === "academic" && (
        <Card className="border-0 shadow-lg">
          <div className="p-6 space-y-4 text-blue-900 dark:text-blue-400">
            <h2 className="font-semibold text-lg">Paramètres académiques</h2>
            <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
              Cette section permettra bientôt de configurer les périodes trimestrielles, le barème des notes
              et les seuils d&apos;alerte d&apos;absences. En attendant, vous pouvez gérer ces éléments depuis les onglets
              &quot;Évaluations&quot; et &quot;Présences&quot;.
            </p>
            <div className="rounded-xl border border-blue-100 dark:border-gray-600 bg-blue-50/60 dark:bg-gray-800/50 p-4">
              <h3 className="font-medium text-sm mb-2">À venir</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-blue-700/80 dark:text-blue-300/80">
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
            <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">Paramètres système</h2>
                <div className="form-group">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="timezone">
                Fuseau horaire
              </label>
                  <select
                id="timezone"
                    className="form-control"
                    value={systemSettings.timezone}
                onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                  >
                    <option value="UTC">UTC</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
                <div className="form-group">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="language">
                Langue
              </label>
                  <select
                id="language"
                    className="form-control"
                    value={systemSettings.language}
                onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="form-group">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="date-format">
                Format de la date
              </label>
                  <select
                id="date-format"
                    className="form-control"
                    value={systemSettings.dateFormat}
                onChange={(e) => setSystemSettings({ ...systemSettings, dateFormat: e.target.value })}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
            <Button
              type="submit"
              className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
            >
              Enregistrer les paramètres système
            </Button>
              </form>
            </Card>
          )}

      {activeTab === "security" && (
        <Card className="border-0 shadow-lg" id="security">
          <div className="p-6 space-y-6">
            <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">Double authentification (2FA)</h2>
            <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
              La double authentification ajoute une couche de sécurité supplémentaire à votre compte. À chaque
              connexion, un code temporaire vous sera envoyé par email que vous devrez entrer en plus de votre mot de
              passe.
            </p>

            <div className="bg-blue-50 dark:bg-gray-800/50 border border-blue-200 dark:border-gray-600 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-400">Statut de la 2FA</h3>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">
                    {twoFactorStatus.enabled
                      ? "✅ Double authentification activée"
                      : "❌ Double authentification désactivée"}
                  </p>
                </div>
              </div>
            </div>

            {!twoFactorStatus.enabled ? (
              <div className="space-y-4">
                {!waitingForCode ? (
                  <div>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-4">
                      Pour activer la 2FA, un code de vérification sera envoyé à votre adresse email. Vous devrez
                      entrer ce code pour finaliser l&apos;activation.
                    </p>
                    <Button
                      onClick={handleEnableTwoFactor}
                      disabled={twoFactorLoading}
                      className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                    >
                      {twoFactorLoading ? "Envoi en cours..." : "Activer la 2FA"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        📧 Un code de vérification a été envoyé à votre adresse email. Vérifiez votre boîte de
                        réception (et les spams si nécessaire).
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                        Entrez le code de vérification à 6 chiffres :
                      </p>
                      <input
                        type="text"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="form-control text-center text-2xl tracking-widest font-mono"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Le code est valide pendant 10 minutes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerifyAndEnable}
                        disabled={twoFactorLoading || verificationCode.length !== 6}
                        className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      >
                        {twoFactorLoading ? "Vérification..." : "Vérifier et activer"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setWaitingForCode(false);
                          setVerificationCode("");
                        }}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    ✅ La double authentification est activée. À chaque connexion, vous recevrez un code par email
                    que vous devrez entrer pour accéder à votre compte.
                  </p>
                </div>
                <Button
                  onClick={handleDisableTwoFactor}
                  disabled={twoFactorLoading}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  {twoFactorLoading ? "Désactivation..." : "Désactiver la 2FA"}
                </Button>
              </div>
            )}
              </div>
            </Card>
          )}

      {activeTab === "backup" && (
        <Card className="border-0 shadow-lg">
          <div className="p-6 space-y-4">
            <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">Gestion des sauvegardes</h2>
            <div className="bg-blue-50 dark:bg-gray-800/50 p-4 rounded-xl border border-blue-100 dark:border-gray-600 text-sm text-blue-800 dark:text-blue-300">
              <strong>ℹ</strong> Fonctionnalité de sauvegarde à implémenter
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleBackup}
                className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
              >
                Créer une sauvegarde
              </Button>
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                Restaurer une sauvegarde
              </Button>
        </div>
    </div>
        </Card>
      )}
    </AdminLayout>
  );
};
