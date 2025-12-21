import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext'; // Import du hook
import { useLanguage } from '../../contexts/LanguageContext';

const SettingsPage: React.FC = () => {
  // Récupération du thème actuel et de la fonction pour changer
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  // --- ÉTATS EXISTANTS ---
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const Toggle = ({ checked, onChange, label, description }: { checked: boolean, onChange: (val: boolean) => void, label: string, description?: string }) => (
    <div className="flex items-center justify-between py-4">
      <div>
        {/* Texte s'adapte au mode sombre (dark:text-white) */}
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h4>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
      <button
        title={label}
        onClick={() => onChange(!checked)}
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
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

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-1">
          {t('settings.appSettings')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">{t('settings.managePreferences')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- SECTION APPARENCE (NOUVEAU) --- */}
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
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${
                        theme === 'light' 
                          ? 'bg-white text-blue-600 shadow' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      ☀️ {t('settings.light')}
                    </button>
                    <button
                      onClick={() => theme === 'light' && toggleTheme()}
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
            <Toggle 
              label={t('settings.twoFactor')} 
              description={t('settings.twoFactorDesc')}
              checked={twoFactorAuth} 
              onChange={setTwoFactorAuth} 
            />
            
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
            />
            <Toggle 
              label={t('settings.smsAlerts')} 
              description={t('settings.smsAlertsDesc')}
              checked={smsAlerts} 
              onChange={setSmsAlerts} 
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