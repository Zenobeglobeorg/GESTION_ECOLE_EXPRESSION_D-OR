import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";
import * as profileService from "../../services/profileService";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAdminTheme } from "../../contexts/AdminThemeContext";
import type { AdminThemeColor } from "../../contexts/AdminThemeContext";

export const Profile = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { themeColor, setThemeColor, colors } = useAdminTheme();
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
    adminThemeColor: "blue-yellow" as AdminThemeColor,
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
        adminThemeColor: (userProfile.adminThemeColor as AdminThemeColor) || "blue-yellow",
      });
      // Synchroniser le thème avec le contexte
      if (userProfile.theme && userProfile.theme !== theme) {
        setTheme(userProfile.theme as "light" | "dark");
      }
      // Synchroniser la langue avec le contexte
      if (userProfile.language && userProfile.language !== language) {
        setLanguage(userProfile.language as "fr" | "en");
      }
      // Synchroniser les couleurs avec le contexte
      if (userProfile.adminThemeColor && userProfile.adminThemeColor !== themeColor) {
        setThemeColor(userProfile.adminThemeColor as AdminThemeColor);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement du profil");
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
        adminThemeColor: preferences.adminThemeColor,
      });
      setProfile(updated);
      // Mettre à jour les contextes
      if (preferences.theme !== theme) {
        setTheme(preferences.theme);
      }
      if (preferences.language !== language) {
        setLanguage(preferences.language);
      }
      if (preferences.adminThemeColor !== themeColor) {
        setThemeColor(preferences.adminThemeColor);
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

  const handleColorThemeChange = (newColorTheme: AdminThemeColor) => {
    setPreferences({ ...preferences, adminThemeColor: newColorTheme });
    setThemeColor(newColorTheme);
    profileService.updatePreferences({ ...preferences, adminThemeColor: newColorTheme }).catch(err => {
      console.warn("Erreur lors de la sauvegarde du thème de couleurs:", err);
    });
  };

  const colorThemes: { value: AdminThemeColor; label: string; preview: { primary: string; secondary: string } }[] = [
    { value: 'blue-yellow', label: t('theme.blueYellow'), preview: { primary: 'bg-blue-500', secondary: 'bg-yellow-400' } },
    { value: 'green-teal', label: t('theme.greenTeal'), preview: { primary: 'bg-green-500', secondary: 'bg-teal-400' } },
    { value: 'purple-pink', label: t('theme.purplePink'), preview: { primary: 'bg-purple-500', secondary: 'bg-pink-400' } },
    { value: 'orange-red', label: t('theme.orangeRed'), preview: { primary: 'bg-orange-500', secondary: 'bg-red-400' } },
    { value: 'indigo-blue', label: t('theme.indigoBlue'), preview: { primary: 'bg-indigo-500', secondary: 'bg-blue-400' } },
  ];

  if (loading) {
    return (
      <AdminLayout title={t("profile.title")} subtitle={t("profile.subtitle")}>
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600">Chargement...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout title={t("profile.title")} subtitle={t("profile.subtitle")}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {language === "fr" ? "Impossible de charger le profil" : "Unable to load profile"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("profile.title")}
      subtitle={t("profile.subtitle")}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Card className="border-0 shadow-lg">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                {profile.firstName.charAt(0)}
                {profile.lastName.charAt(0)}
                  </div>
              <h2 className="font-semibold text-blue-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
              <p className="text-xs text-blue-700/70">{profile.email}</p>
              <p className="text-xs text-blue-700/70 mt-1">{language === "fr" ? "Administration" : "Administration"}</p>
                </div>
              </Card>
          <div className="space-y-2">
            {[
              { id: "personal", label: t("profile.personal") },
              { id: "security", label: t("profile.security") },
              { id: "preferences", label: t("profile.preferences") },
            ].map(tab => (
              <Button
                key={tab.id}
                type="button"
                variant="outline"
                className={`w-full justify-start border-2 ${
                  section === tab.id
                    ? "border-yellow-400 text-blue-900 bg-yellow-100"
                    : "border-blue-100 text-blue-700 hover:bg-blue-50"
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
            <Card className="border-0 shadow-lg">
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t("profile.personalInfo")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                    <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="profile-first-name">
                      {t("profile.firstName")}
                    </label>
                        <input
                      id="profile-first-name"
                          className="form-control"
                      value={profileForm.firstName}
                      onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      required
                        />
                      </div>
                      <div className="form-group">
                    <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="profile-last-name">
                      {t("profile.lastName")}
                    </label>
                        <input
                      id="profile-last-name"
                          className="form-control"
                      value={profileForm.lastName}
                      onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="profile-email">
                    {t("profile.email")}
                  </label>
                      <input
                    id="profile-email"
                        type="email"
                    className="form-control dark:bg-gray-600 dark:text-gray-300"
                    value={profile.email}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("profile.emailReadOnly")}</p>
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="profile-phone">
                    {t("profile.phone")}
                  </label>
                  <input
                    id="profile-phone"
                    className="form-control"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                >
                  {t("profile.save")}
                </Button>
              </form>
            </Card>
          )}

          {section === "security" && (
            <Card className="border-0 shadow-lg">
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t("profile.security")}</h2>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="old-password">
                    {t("profile.oldPassword")}
                  </label>
                  <input
                    type="password"
                    id="old-password"
                        className="form-control"
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                      />
                    </div>
                    <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="new-password">
                    {t("profile.newPassword")}
                  </label>
                      <input
                    type="password"
                    id="new-password"
                        className="form-control"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("profile.minPassword")}</p>
                    </div>
                    <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="confirm-password">
                    {t("profile.confirmPassword")}
                  </label>
                      <input
                    type="password"
                    id="confirm-password"
                        className="form-control"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                      />
                    </div>
                <Button className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                  {t("profile.changePassword")}
                </Button>
                  </form>
                </Card>
              )}

          {section === "preferences" && (
            <Card className="border-0 shadow-lg">
              <div className="p-6 space-y-4">
                <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t("profile.preferences")}</h2>
                
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="pref-lang">
                    {t("profile.language")}
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
                    {t("profile.theme")}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {t("profile.themeDescription")}
                  </p>
                  {/* Contrôle du thème avec style toggle compact (inspiré de SettingsPage) */}
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
                    {/* Boutons de choix avec style toggle (même style que SettingsPage) */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => theme !== "light" && handleThemeChange("light")}
                        className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${
                          theme === "light" 
                            ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                        title={t("profile.themeLight")}
                      >
                        ☀️ {t("profile.themeLight")}
                      </button>
                      <button
                        type="button"
                        onClick={() => theme !== "dark" && handleThemeChange("dark")}
                        className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${
                          theme === "dark" 
                            ? "bg-gray-600 dark:bg-gray-500 text-white shadow" 
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                        title={t("profile.themeDark")}
                      >
                        🌙 {t("profile.themeDark")}
                      </button>
                    </div>
                  </div>
                </div>

                    <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="pref-color-theme">
                    {t("profile.colorTheme")}
                  </label>
                  <p className="text-xs text-gray-500 mb-3">{t("profile.colorThemeDescription")}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {colorThemes.map((colorTheme) => (
                      <button
                        key={colorTheme.value}
                        type="button"
                        onClick={() => handleColorThemeChange(colorTheme.value)}
                        className={`p-4 rounded-lg border-2 transition text-left ${
                          preferences.adminThemeColor === colorTheme.value
                            ? "border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 ring-2 ring-yellow-400 dark:ring-yellow-500"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded ${colorTheme.preview.primary}`}></div>
                          <div className={`w-8 h-8 rounded ${colorTheme.preview.secondary}`}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{colorTheme.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {language === "fr" 
                      ? "Les couleurs sont appliquées immédiatement à toute la section administration" 
                      : "Colors are applied immediately to the entire administration section"}
                  </p>
                    </div>

                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400">{t("profile.emailNotifications")}</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={e => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-blue-700/80 dark:text-blue-400">{t("profile.emailNotificationsDesc")}</span>
                  </div>
                </div>

                <Button
                  className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                  onClick={handleUpdatePreferences}
                >
                  {t("profile.savePreferences")}
                </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
    </AdminLayout>
  );
};
