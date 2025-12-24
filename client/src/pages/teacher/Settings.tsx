import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { TeacherLayout } from "../../components/teacher/TeacherLayout";
import * as settingsService from "../../services/settingsService";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("appearance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

      const twoFactorData = await settingsService.getTwoFactorStatus().catch(() => ({ enabled: false, configured: false }));

      setTwoFactorStatus(twoFactorData);
    } catch (err) {
      console.error("Error loading settings:", err);
      setError(err instanceof Error ? err.message : t("settings.loadError") || "Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    // Mettre à jour immédiatement le thème dans le contexte
    setTheme(newTheme);
    
    // Sauvegarder dans le backend
    try {
      const profileService = await import("../../services/profileService");
      await profileService.updatePreferences({ theme: newTheme });
      setSuccess(language === "fr" ? "Thème mis à jour avec succès" : "Theme updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.warn("Erreur lors de la sauvegarde du thème:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde du thème");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleLanguageChange = async (newLanguage: "fr" | "en") => {
    // Mettre à jour immédiatement la langue dans le contexte
    setLanguage(newLanguage);
    
    // Sauvegarder dans le backend
    try {
      const profileService = await import("../../services/profileService");
      await profileService.updatePreferences({ language: newLanguage });
      setSuccess(language === "fr" ? "Langue mise à jour avec succès" : "Language updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.warn("Erreur lors de la sauvegarde de la langue:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde de la langue");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      setTwoFactorLoading(true);
      setError(null);
      setSuccess(null);
      const result = await settingsService.enableTwoFactor();
      
      // Vérifier si l'email a été envoyé avec succès
      if (result.success === false || (result.emailSent === false && !result.success)) {
        setError(
          result.error || result.message || 
          (language === "fr" 
            ? "Erreur lors de l'envoi du code de vérification. Veuillez réessayer ou contacter l'administration."
            : "Error sending verification code. Please try again or contact administration.")
        );
        setTimeout(() => setError(null), 5000);
        return;
      }
      
      setWaitingForCode(true);
      setVerificationCode("");
      setSuccess(
        result.emailSent
          ? (language === "fr" 
              ? "Code de vérification envoyé par email. Vérifiez votre boîte de réception."
              : "Verification code sent by email. Check your inbox.")
          : (language === "fr"
              ? "Code de vérification généré. Vérifiez votre email ou la console (mode développement)."
              : "Verification code generated. Check your email or console (development mode).")
      );
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (language === "fr" ? "Erreur lors de l'envoi du code" : "Error sending code"));
      setTimeout(() => setError(null), 5000);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError(language === "fr" ? "Veuillez entrer un code de vérification à 6 chiffres" : "Please enter a 6-digit verification code");
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
      setSuccess(language === "fr" ? "Double authentification activée avec succès !" : "Two-factor authentication enabled successfully!");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (language === "fr" ? "Erreur lors de la vérification du code" : "Error verifying code"));
      setTimeout(() => setError(null), 5000);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!confirm(language === "fr" ? "Êtes-vous sûr de vouloir désactiver la double authentification ?" : "Are you sure you want to disable two-factor authentication?")) {
      return;
    }

    try {
      setTwoFactorLoading(true);
      setError(null);
      await settingsService.disableTwoFactor(""); // Le backend vérifie l'authentification
      setTwoFactorStatus({ enabled: false });
      setWaitingForCode(false);
      setVerificationCode("");
      setSuccess(language === "fr" ? "Double authentification désactivée avec succès" : "Two-factor authentication disabled successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (language === "fr" ? "Erreur lors de la désactivation de la 2FA" : "Error disabling 2FA"));
      setTimeout(() => setError(null), 5000);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const tabs = [
    { id: "appearance", label: t("settings.appearance") || "Apparence" },
    { id: "security", label: t("settings.security") || "Sécurité" },
  ];

  if (loading) {
    return (
      <TeacherLayout title={t("settings.title") || "Paramètres"} subtitle={t("settings.subtitle") || "Gérer vos paramètres"}>
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600 dark:text-blue-400">{t("common.loading") || "Chargement..."}</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title={t("settings.title") || "Paramètres"}
      subtitle={t("settings.subtitle") || "Gérer vos paramètres"}
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

      {activeTab === "appearance" && (
        <Card className="border-0 shadow-lg dark:bg-gray-800">
          <div className="p-6 space-y-6">
            <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t("settings.appearance") || "Apparence"}</h2>
            
            {/* CONTROLE DU THEME */}
            <div className="py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t("settings.darkMode") || "Mode Sombre"}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("settings.darkModeDesc") || "Basculer entre le thème clair et sombre"}</p>
              </div>
              {/* Boutons de choix */}
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => theme !== "light" && handleThemeChange("light")}
                  className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${
                    theme === "light" 
                      ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  ☀️ {t("settings.light") || "Clair"}
                </button>
                <button
                  onClick={() => theme !== "dark" && handleThemeChange("dark")}
                  className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${
                    theme === "dark" 
                      ? "bg-gray-600 dark:bg-gray-500 text-white shadow" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  🌙 {t("settings.dark") || "Sombre"}
                </button>
              </div>
            </div>

            {/* CONTROLE DE LA LANGUE */}
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t("settings.language") || "Langue"}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("settings.languageDesc") || "Choisissez votre langue d'interface"}</p>
              </div>
              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as "fr" | "en")}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "security" && (
        <Card className="border-0 shadow-lg dark:bg-gray-800" id="security">
          <div className="p-6 space-y-6">
            <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t("settings.security") || "Sécurité"}</h2>
            <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
              {language === "fr"
                ? "La double authentification ajoute une couche de sécurité supplémentaire à votre compte. À chaque connexion, un code temporaire vous sera envoyé par email que vous devrez entrer en plus de votre mot de passe."
                : "Two-factor authentication adds an extra layer of security to your account. At each login, a temporary code will be sent to you by email that you will need to enter in addition to your password."}
            </p>

            <div className="bg-blue-50 dark:bg-gray-800/50 border border-blue-200 dark:border-gray-600 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-400">{t("settings.twoFactorStatus") || "Statut de la 2FA"}</h3>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">
                    {twoFactorStatus.enabled
                      ? (language === "fr" ? "✅ Double authentification activée" : "✅ Two-factor authentication enabled")
                      : (language === "fr" ? "❌ Double authentification désactivée" : "❌ Two-factor authentication disabled")}
                  </p>
                </div>
              </div>
            </div>

            {!twoFactorStatus.enabled ? (
              <div className="space-y-4">
                {!waitingForCode ? (
                  <div>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-4">
                      {language === "fr"
                        ? "Pour activer la 2FA, un code de vérification sera envoyé à votre adresse email. Vous devrez entrer ce code pour finaliser l'activation."
                        : "To enable 2FA, a verification code will be sent to your email address. You will need to enter this code to finalize activation."}
                    </p>
                    <Button
                      onClick={handleEnableTwoFactor}
                      disabled={twoFactorLoading}
                      className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                    >
                      {twoFactorLoading 
                        ? (language === "fr" ? "Envoi en cours..." : "Sending...")
                        : (language === "fr" ? "Activer la 2FA" : "Enable 2FA")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        📧 {language === "fr"
                          ? "Un code de vérification a été envoyé à votre adresse email. Vérifiez votre boîte de réception (et les spams si nécessaire)."
                          : "A verification code has been sent to your email address. Check your inbox (and spam if necessary)."}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                        {language === "fr" ? "Entrez le code de vérification à 6 chiffres :" : "Enter the 6-digit verification code:"}
                      </p>
                      <input
                        type="text"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="form-control text-center text-2xl tracking-widest font-mono dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {language === "fr" ? "Le code est valide pendant 10 minutes" : "The code is valid for 10 minutes"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerifyAndEnable}
                        disabled={twoFactorLoading || verificationCode.length !== 6}
                        className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      >
                        {twoFactorLoading 
                          ? (language === "fr" ? "Vérification..." : "Verifying...")
                          : (language === "fr" ? "Vérifier et activer" : "Verify and enable")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setWaitingForCode(false);
                          setVerificationCode("");
                        }}
                        className="border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400"
                      >
                        {t("common.cancel") || "Annuler"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    ✅ {language === "fr"
                      ? "La double authentification est activée. À chaque connexion, vous recevrez un code par email que vous devrez entrer pour accéder à votre compte."
                      : "Two-factor authentication is enabled. At each login, you will receive a code by email that you will need to enter to access your account."}
                  </p>
                </div>
                <Button
                  onClick={handleDisableTwoFactor}
                  disabled={twoFactorLoading}
                  variant="outline"
                  className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400"
                >
                  {twoFactorLoading 
                    ? (language === "fr" ? "Désactivation..." : "Disabling...")
                    : (language === "fr" ? "Désactiver la 2FA" : "Disable 2FA")}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </TeacherLayout>
  );
};







