import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import * as settingsService from '../../services/settingsService';
import { Button } from '../../components/ui/Button';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, t } = useLanguage();
  
  // États généraux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États 2FA
  const [twoFactorStatus, setTwoFactorStatus] = useState<settingsService.TwoFactorStatus>({
    enabled: false,
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [waitingForCode, setWaitingForCode] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  
  // États notifications (pour l'instant statiques, à implémenter plus tard)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Charger les données au montage
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const twoFactorData = await settingsService.getTwoFactorStatus().catch(() => ({ enabled: false }));
      setTwoFactorStatus(twoFactorData);
    } catch (err) {
      console.error("Erreur lors du chargement des paramètres:", err);
      setError(err instanceof Error ? err.message : t("settings.loadError") || "Erreur lors du chargement des paramètres");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    // Mettre à jour immédiatement le thème dans le contexte
    toggleTheme();
    
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
      // Pour la désactivation, on demande le mot de passe (à implémenter si nécessaire)
      // Pour l'instant, on désactive directement
      await settingsService.disableTwoFactor("");
      setTwoFactorStatus({ enabled: false });
      setSuccess(language === "fr" ? "Double authentification désactivée avec succès" : "Two-factor authentication disabled successfully");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (language === "fr" ? "Erreur lors de la désactivation" : "Error disabling 2FA"));
      setTimeout(() => setError(null), 5000);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const Toggle = ({ checked, onChange, label, description, disabled }: { 
    checked: boolean, 
    onChange: (val: boolean) => void, 
    label: string, 
    description?: string,
    disabled?: boolean
  }) => (
    <div className="flex items-center justify-between py-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h4>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      <button
        title={label}
        onClick={() => !disabled && onChange(!checked)}
        type="button"
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-1">
          {t('settings.appSettings')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">{t('settings.managePreferences')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- SECTION APPARENCE --- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <span className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </span>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">{t('settings.appearance')}</h3>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
             {/* CONTROLE DU THEME */}
             <div className="py-4 flex items-center justify-between">
                <div>
                   <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.darkMode')}</h4>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('settings.darkModeDesc')}</p>
                </div>
                {/* Boutons de choix */}
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                      onClick={() => theme === 'dark' && handleThemeChange('light')}
                      className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${
                        theme === 'light' 
                          ? 'bg-white text-blue-600 shadow' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      ☀️ {t('settings.light')}
                    </button>
                    <button
                      onClick={() => theme === 'light' && handleThemeChange('dark')}
                      className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${
                        theme === 'dark' 
                          ? 'bg-gray-600 text-white shadow' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      🌙 {t('settings.dark')}
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* --- SECTION SÉCURITÉ --- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </span>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">{t('settings.security')}</h3>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* 2FA Section */}
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('settings.twoFactor')}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('settings.twoFactorDesc')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  twoFactorStatus.enabled 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {twoFactorStatus.enabled 
                    ? (language === "fr" ? "Activée" : "Enabled") 
                    : (language === "fr" ? "Désactivée" : "Disabled")
                  }
                </span>
              </div>

              {!twoFactorStatus.enabled ? (
                <div className="space-y-3">
                  {!waitingForCode ? (
                    <Button
                      onClick={handleEnableTwoFactor}
                      disabled={twoFactorLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      {twoFactorLoading 
                        ? (language === "fr" ? "Envoi en cours..." : "Sending...")
                        : (language === "fr" ? "Activer la double authentification" : "Enable two-factor authentication")
                      }
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === "fr" 
                          ? "Entrez le code de vérification envoyé à votre email :"
                          : "Enter the verification code sent to your email:"
                        }
                      </p>
                      <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder={language === "fr" ? "000000" : "000000"}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleVerifyAndEnable}
                          disabled={twoFactorLoading || verificationCode.length !== 6}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                        >
                          {twoFactorLoading 
                            ? (language === "fr" ? "Vérification..." : "Verifying...")
                            : (language === "fr" ? "Vérifier et activer" : "Verify and enable")
                          }
                        </Button>
                        <Button
                          onClick={() => {
                            setWaitingForCode(false);
                            setVerificationCode("");
                          }}
                          disabled={twoFactorLoading}
                          variant="outline"
                          className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {language === "fr" ? "Annuler" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleDisableTwoFactor}
                  disabled={twoFactorLoading}
                  variant="outline"
                  className="w-full border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"
                >
                  {twoFactorLoading 
                    ? (language === "fr" ? "Désactivation..." : "Disabling...")
                    : (language === "fr" ? "Désactiver la double authentification" : "Disable two-factor authentication")
                  }
                </Button>
              )}
            </div>
            
            <div className="py-4">
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                {t('settings.changePassword')}
              </button>
            </div>
          </div>
        </div>

        {/* --- SECTION NOTIFICATIONS --- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <span className="p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </span>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">{t('settings.alerts')}</h3>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <Toggle 
              label={t('settings.emailAlerts')} 
              description={t('settings.emailAlertsDesc')}
              checked={emailAlerts} 
              onChange={setEmailAlerts}
              disabled={true}
            />
            <Toggle 
              label={t('settings.smsAlerts')} 
              description={t('settings.smsAlertsDesc')}
              checked={smsAlerts} 
              onChange={setSmsAlerts}
              disabled={true}
            />
          </div>
        </div>

        {/* --- SECTION AIDE --- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
           <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <span className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">{t('settings.help')}</h3>
          </div>

          <div className="space-y-3">
             <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-gray-700 dark:text-gray-200 rounded-lg transition-colors">
                <span className="text-sm font-medium">{t('settings.contactSupport')}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
             {/* Version */}
             <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xs text-gray-400">{t('settings.version')}</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
