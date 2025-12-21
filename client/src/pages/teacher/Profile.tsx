import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { TeacherLayout } from "../../components/teacher/TeacherLayout";
import * as profileService from "../../services/profileService";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";

export const Profile = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [section, setSection] = useState("personal");

  const [profile, setProfile] = useState<profileService.UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    theme: "light" as "light" | "dark",
    language: "fr" as "fr" | "en",
    emailNotifications: true,
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await profileService.getCurrentUser();
      setProfile(userProfile);
      setProfileForm({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone || "",
      });
      setPreferences({
        theme: (userProfile.theme as "light" | "dark") || "light",
        language: (userProfile.language as "fr" | "en") || "fr",
        emailNotifications: userProfile.emailNotifications ?? true,
      });
      // Synchroniser le thème avec le contexte
      if (userProfile.theme && userProfile.theme !== theme) {
        setTheme(userProfile.theme as "light" | "dark");
      }
      // Synchroniser la langue avec le contexte
      if (userProfile.language && userProfile.language !== language) {
        setLanguage(userProfile.language as "fr" | "en");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err instanceof Error ? err.message : t("profile.loadError") || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const updated = await profileService.updateProfile(profileForm);
      setProfile(updated);
      setSuccess(t("profile.save") + " - " + (language === "fr" ? "Profil mis à jour avec succès" : "Profile updated successfully"));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(language === "fr" ? "Les mots de passe ne correspondent pas" : "Passwords do not match");
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError(language === "fr" ? "Le mot de passe doit contenir au moins 6 caractères" : "Password must be at least 6 characters");
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setError(null);
      await profileService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess(language === "fr" ? "Mot de passe modifié avec succès" : "Password changed successfully");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du changement de mot de passe");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      setError(null);
      const updated = await profileService.updatePreferences({
        theme: preferences.theme,
        language: preferences.language,
        emailNotifications: preferences.emailNotifications,
      });
      setProfile(updated);
      // Mettre à jour les contextes
      if (preferences.theme !== theme) {
        setTheme(preferences.theme);
      }
      if (preferences.language !== language) {
        setLanguage(preferences.language);
      }
      setSuccess(language === "fr" ? "Préférences sauvegardées avec succès" : "Preferences saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde des préférences");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    // Mettre à jour immédiatement le thème dans le contexte (applique à toute l'application)
    setTheme(newTheme);
    setPreferences({ ...preferences, theme: newTheme });
    
    // Sauvegarder dans le backend (en arrière-plan)
    try {
      await profileService.updatePreferences({ theme: newTheme });
    } catch (err) {
      console.warn("Erreur lors de la sauvegarde du thème:", err);
    }
  };

  const handleLanguageChange = async (newLanguage: "fr" | "en") => {
    // Mettre à jour immédiatement la langue dans le contexte (applique à toute l'application)
    setLanguage(newLanguage);
    setPreferences({ ...preferences, language: newLanguage });
    
    // Sauvegarder dans le backend (en arrière-plan)
    try {
      await profileService.updatePreferences({ language: newLanguage });
    } catch (err) {
      console.warn("Erreur lors de la sauvegarde de la langue:", err);
    }
  };

  if (loading) {
    return (
      <TeacherLayout title={t("profile.title") || "Profil"} subtitle={t("profile.subtitle") || "Gérer votre profil"}>
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600 dark:text-blue-400">{t("common.loading") || "Chargement..."}</div>
        </div>
      </TeacherLayout>
    );
  }

  if (!profile) {
    return (
      <TeacherLayout title={t("profile.title") || "Profil"} subtitle={t("profile.subtitle") || "Gérer votre profil"}>
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {language === "fr" ? "Impossible de charger le profil" : "Unable to load profile"}
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title={t("profile.title") || "Profil"}
      subtitle={t("profile.subtitle") || "Gérer votre profil"}
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

      <div className="max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Card className="border-0 shadow-lg dark:bg-gray-800">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                {profile.firstName.charAt(0)}
                {profile.lastName.charAt(0)}
              </div>
              <h2 className="font-semibold text-blue-900 dark:text-blue-400">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-xs text-blue-700/70 dark:text-blue-300/70">{profile.email}</p>
              <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">{t("teacher.role") || "Enseignant"}</p>
            </div>
          </Card>
          <div className="space-y-2">
            {[
              { id: "personal", label: t("profile.personal") || "Informations personnelles" },
              { id: "security", label: t("profile.security") || "Sécurité" },
              { id: "preferences", label: t("profile.preferences") || "Préférences" },
            ].map(tab => (
              <Button
                key={tab.id}
                type="button"
                variant="outline"
                className={`w-full justify-start border-2 ${
                  section === tab.id
                    ? "border-yellow-400 text-blue-900 dark:text-blue-400 bg-yellow-100 dark:bg-yellow-900/30"
                    : "border-blue-100 dark:border-gray-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => setSection(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          {section === "personal" && (
            <Card className="border-0 shadow-lg dark:bg-gray-800">
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t("profile.personalInfo") || "Informations personnelles"}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="profile-first-name">
                      {t("profile.firstName") || "Prénom"}
                    </label>
                    <input
                      id="profile-first-name"
                      className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={profileForm.firstName}
                      onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="profile-last-name">
                      {t("profile.lastName") || "Nom"}
                    </label>
                    <input
                      id="profile-last-name"
                      className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={profileForm.lastName}
                      onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="profile-email">
                    {t("profile.email") || "Email"}
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    className="form-control dark:bg-gray-600 dark:text-gray-300"
                    value={profile.email}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("profile.emailReadOnly") || "L'email ne peut pas être modifié"}</p>
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="profile-phone">
                    {t("profile.phone") || "Téléphone"}
                  </label>
                  <input
                    id="profile-phone"
                    className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                >
                  {t("profile.save") || "Enregistrer"}
                </Button>
              </form>
            </Card>
          )}

          {section === "security" && (
            <Card className="border-0 shadow-lg dark:bg-gray-800">
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t("profile.security") || "Sécurité"}</h2>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="old-password">
                    {t("profile.oldPassword") || "Ancien mot de passe"}
                  </label>
                  <input
                    type="password"
                    id="old-password"
                    className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="new-password">
                    {t("profile.newPassword") || "Nouveau mot de passe"}
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("profile.minPassword") || "Minimum 6 caractères"}</p>
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="confirm-password">
                    {t("profile.confirmPassword") || "Confirmer le mot de passe"}
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <Button className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                  {t("profile.changePassword") || "Changer le mot de passe"}
                </Button>
              </form>
            </Card>
          )}

          {section === "preferences" && (
            <Card className="border-0 shadow-lg dark:bg-gray-800">
              <div className="p-6 space-y-4">
                <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t("profile.preferences") || "Préférences"}</h2>
                
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="pref-lang">
                    {t("profile.language") || "Langue"}
                  </label>
                  <select
                    id="pref-lang"
                    className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={language}
                    onChange={e => handleLanguageChange(e.target.value as "fr" | "en")}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language === "fr" ? "La langue est appliquée immédiatement" : "Language is applied immediately"}
                  </p>
                </div>

                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="pref-theme">
                    {t("profile.theme") || "Thème"}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {t("profile.themeDescription") || "Choisissez votre thème d'affichage"}
                  </p>
                  {/* Contrôle du thème avec style toggle compact */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {language === "fr" ? "Mode Sombre" : "Dark Mode"}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {language === "fr" 
                          ? "Basculer entre le thème clair et sombre." 
                          : "Toggle between light and dark theme."}
                      </p>
                    </div>
                    {/* Boutons de choix avec style toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => theme !== "light" && handleThemeChange("light")}
                        className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${
                          theme === "light" 
                            ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                        title={t("profile.themeLight") || "Clair"}
                      >
                        ☀️ {t("profile.themeLight") || "Clair"}
                      </button>
                      <button
                        type="button"
                        onClick={() => theme !== "dark" && handleThemeChange("dark")}
                        className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${
                          theme === "dark" 
                            ? "bg-gray-600 dark:bg-gray-500 text-white shadow" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                        title={t("profile.themeDark") || "Sombre"}
                      >
                        🌙 {t("profile.themeDark") || "Sombre"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400">{t("profile.emailNotifications") || "Notifications par email"}</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={e => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-blue-700/80 dark:text-blue-400">{t("profile.emailNotificationsDesc") || "Recevoir des notifications par email"}</span>
                  </div>
                </div>

                <Button
                  className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                  onClick={handleUpdatePreferences}
                >
                  {t("profile.savePreferences") || "Enregistrer les préférences"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};







