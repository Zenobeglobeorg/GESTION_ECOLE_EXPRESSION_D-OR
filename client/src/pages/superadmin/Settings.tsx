import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import * as settingsService from "../../services/settingsService";
import { Sidebar } from "../../components/layout/Sidebar";
import { MobileSidebar } from "../../components/layout/MobileSidebar";
import { Navbar } from "../../components/layout/Navbar";
import { useLanguage } from "../../contexts/LanguageContext";

export const Settings = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        settingsService.getTwoFactorStatus().catch(() => ({ enabled: false })),
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
      setError(err instanceof Error ? err.message : t('settingsSuperAdmin.loading'));
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
      setSuccess(t('settingsSuperAdmin.saveSettings') + ' - ' + (language === 'fr' ? 'Paramètres de l\'école mis à jour avec succès' : 'School settings updated successfully'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving'));
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await settingsService.updateSystemSettings(systemSettings);
      setSuccess(t('settingsSuperAdmin.saveSystemSettings') + ' - ' + (language === 'fr' ? 'Paramètres système mis à jour avec succès' : 'System settings updated successfully'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving'));
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
          ? t('settingsSuperAdmin.codeSent')
          : (language === 'fr' ? 'Code de vérification généré. Vérifiez votre email ou la console (mode développement).' : 'Verification code generated. Check your email or console (development mode).')
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
      setError(t('settingsSuperAdmin.enterCode'));
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
      setSuccess(t('settingsSuperAdmin.twoFactorEnabled'));
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (language === 'fr' ? 'Erreur lors de la vérification du code' : 'Error verifying code'));
      setTimeout(() => setError(null), 5000);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!confirm(t('settingsSuperAdmin.disableConfirm'))) {
      return;
    }

    try {
      setTwoFactorLoading(true);
      setError(null);
      await settingsService.disableTwoFactor("");
      setTwoFactorStatus({ enabled: false });
      setWaitingForCode(false);
      setVerificationCode("");
      setSuccess(t('settingsSuperAdmin.twoFactorDisabled'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (language === 'fr' ? 'Erreur lors de la désactivation de la 2FA' : 'Error disabling 2FA'));
      setTimeout(() => setError(null), 5000);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleBackup = () => {
    alert("Fonctionnalité de sauvegarde à implémenter");
  };

  const tabs = [
    { id: "general", label: t('settingsSuperAdmin.general') },
    { id: "academic", label: t('settingsSuperAdmin.academic') },
    { id: "system", label: t('settingsSuperAdmin.system') },
    { id: "security", label: t('settingsSuperAdmin.security') },
    { id: "backup", label: t('settingsSuperAdmin.backup') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          <div className="pt-16 p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-blue-600 dark:text-blue-400">{t('settingsSuperAdmin.loading')}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <div className="pt-16 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">{t('settingsSuperAdmin.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('settingsSuperAdmin.subtitle')}</p>

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
                  <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t('settingsSuperAdmin.generalInfo')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="school-name">
                        {t('settingsSuperAdmin.schoolName')}
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
                        {t('settingsSuperAdmin.schoolCode')}
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
                      {t('settingsSuperAdmin.address')}
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
                        {t('settingsSuperAdmin.phone')}
                      </label>
                      <input
                        id="school-phone"
                        className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        value={schoolSettings.phone}
                        onChange={(e) => setSchoolSettings({ ...schoolSettings, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="school-email">
                        {t('settingsSuperAdmin.email')}
                      </label>
                      <input
                        id="school-email"
                        type="email"
                        className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        value={schoolSettings.email}
                        onChange={(e) => setSchoolSettings({ ...schoolSettings, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="school-director">
                      {t('settingsSuperAdmin.director')}
                    </label>
                    <input
                      id="school-director"
                      className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={schoolSettings.director}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, director: e.target.value })}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-600"
                  >
                    {t('settingsSuperAdmin.saveSettings')}
                  </Button>
                </form>
              </Card>
            )}

            {activeTab === "academic" && (
              <Card className="border-0 shadow-lg dark:bg-gray-800">
                <div className="p-6 space-y-4 text-blue-900 dark:text-blue-400">
                  <h2 className="font-semibold text-lg">{t('settingsSuperAdmin.academicSettings')}</h2>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
                    {t('settingsSuperAdmin.academicDesc')}
                  </p>
                  <div className="rounded-xl border border-blue-100 dark:border-gray-600 bg-blue-50/60 dark:bg-gray-800/50 p-4">
                    <h3 className="font-medium text-sm mb-2">{t('settingsSuperAdmin.comingSoon')}</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside text-blue-700/80 dark:text-blue-300/80">
                      <li>{t('settingsSuperAdmin.comingSoon1')}</li>
                      <li>{t('settingsSuperAdmin.comingSoon2')}</li>
                      <li>{t('settingsSuperAdmin.comingSoon3')}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "system" && (
              <Card className="border-0 shadow-lg dark:bg-gray-800">
                <form onSubmit={handleUpdateSystem} className="p-6 space-y-4">
                  <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t('settingsSuperAdmin.systemSettings')}</h2>
                  <div className="form-group">
                    <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="timezone">
                      {t('settingsSuperAdmin.timezone')}
                    </label>
                    <select
                      id="timezone"
                      className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
                      {t('settingsSuperAdmin.language')}
                    </label>
                    <select
                      id="language"
                      className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={systemSettings.language}
                      onChange={(e) => setSystemSettings({ ...systemSettings, language: e.target.value })}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="date-format">
                      {t('settingsSuperAdmin.dateFormat')}
                    </label>
                    <select
                      id="date-format"
                      className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
                    className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-600"
                  >
                    {t('settingsSuperAdmin.saveSystemSettings')}
                  </Button>
                </form>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="border-0 shadow-lg dark:bg-gray-800" id="security">
                <div className="p-6 space-y-6">
                  <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t('settingsSuperAdmin.twoFactorTitle')}</h2>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
                    {t('settingsSuperAdmin.twoFactorDesc')}
                  </p>

                  <div className="bg-blue-50 dark:bg-gray-800/50 border border-blue-200 dark:border-gray-600 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-400">{t('settingsSuperAdmin.twoFactorStatus')}</h3>
                        <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">
                          {twoFactorStatus.enabled
                            ? t('settingsSuperAdmin.twoFactorEnabled')
                            : t('settingsSuperAdmin.twoFactorDisabled')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!twoFactorStatus.enabled ? (
                    <div className="space-y-4">
                      {!waitingForCode ? (
                        <div>
                          <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-4">
                            {t('settingsSuperAdmin.enableTwoFactorDesc')}
                          </p>
                          <Button
                            onClick={handleEnableTwoFactor}
                            disabled={twoFactorLoading}
                            className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-600"
                          >
                            {twoFactorLoading ? t('settingsSuperAdmin.sending') : t('settingsSuperAdmin.enable2FA')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              {t('settingsSuperAdmin.codeSent')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                              {t('settingsSuperAdmin.enterCode')}
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
                              {t('settingsSuperAdmin.codeValid')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleVerifyAndEnable}
                              disabled={twoFactorLoading || verificationCode.length !== 6}
                              className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                            >
                              {twoFactorLoading ? t('settingsSuperAdmin.verifying') : t('settingsSuperAdmin.verifyAndEnable')}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setWaitingForCode(false);
                                setVerificationCode("");
                              }}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/30"
                            >
                              {t('settingsSuperAdmin.cancel')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <p className="text-sm text-green-800 dark:text-green-300">
                          {t('settingsSuperAdmin.twoFactorActiveDesc')}
                        </p>
                      </div>
                      <Button
                        onClick={handleDisableTwoFactor}
                        disabled={twoFactorLoading}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30"
                      >
                        {twoFactorLoading ? t('settingsSuperAdmin.disabling') : t('settingsSuperAdmin.disable2FA')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === "backup" && (
              <Card className="border-0 shadow-lg dark:bg-gray-800">
                <div className="p-6 space-y-4">
                  <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">{t('settingsSuperAdmin.backupManagement')}</h2>
                  <div className="bg-blue-50 dark:bg-gray-800/50 p-4 rounded-xl border border-blue-100 dark:border-gray-600 text-sm text-blue-800 dark:text-blue-300">
                    <strong>ℹ</strong> {t('settingsSuperAdmin.backupInfo')}
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={handleBackup}
                      className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-600"
                    >
                      {t('settingsSuperAdmin.createBackup')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/30"
                    >
                      {t('settingsSuperAdmin.restoreBackup')}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

