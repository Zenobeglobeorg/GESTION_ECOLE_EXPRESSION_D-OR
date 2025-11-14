// Enregistrez ce fichier sous: src/pages/parent/ProfilParentPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Interface pour le profil du PARENT
interface ParentProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string; // URL de la photo de profil
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  timezone: string;
}

// Interface pour les données du mot de passe
interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// --- DONNÉES FACTICES (MOCK DATA) ---
const mockParentProfile: ParentProfile = {
  firstName: 'Ousmane',
  lastName: 'Diop',
  email: 'parent@example.com',
  phone: '+221771234567',
  avatarUrl: '', // Laisser vide pour utiliser les initiales
  notificationPreferences: {
    email: true,
    sms: false,
    push: true,
  },
  language: 'fr',
  timezone: 'Africa/Dakar',
};
// ---

const ProfilParentPage: React.FC = () => {
  
  const [parentData, setParentData] = useState<ParentProfile>(mockParentProfile);
  const [activeTab, setActiveTab] = useState<'parent' | 'password'>('parent');
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const navigate = useNavigate();

  // --- FAUSSES FONCTIONS DE SAUVEGARDE (Simulation) ---
  const onParentProfileUpdate = (profile: ParentProfile) => {
    console.log('FAUX SAUVEGARDE (Parent):', profile);
    alert('Profil parent mis à jour ! (Simulation)');
  };

  const onPasswordChange = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    console.log('FAUX CHANGEMENT DE MDP:', currentPassword, newPassword);
    if (currentPassword !== 'password123') {
      console.log('Simulation: mot de passe actuel incorrect');
      return false; 
    }
    console.log('Simulation: mot de passe changé');
    return true;
  };
  // ---

  // ... (Toute la logique handle...Change et validatePassword reste identique) ...
  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setParentData(prev => ({
        ...prev,
        [parentKey]: {
          ...(prev[parentKey as keyof ParentProfile] as Record<string, boolean>),
          [childKey]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setParentData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors.length > 0) setPasswordErrors([]);
    if (passwordSuccess) setPasswordSuccess(false);
  };

  const validatePassword = (): string[] => {
    const errors: string[] = [];
    if (passwordData.newPassword.length < 8) errors.push('Le mot de passe doit contenir au moins 8 caractères');
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(passwordData.newPassword)) errors.push('Doit contenir une majuscule et une minuscule');
    if (!/(?=.*\d)/.test(passwordData.newPassword)) errors.push('Doit contenir au moins un chiffre');
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.push('Les mots de passe ne correspondent pas');
    return errors;
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onParentProfileUpdate(parentData);
    navigate('/parent'); 
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePassword();
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setIsChangingPassword(true);
    setPasswordErrors([]);
    try {
      const success = await onPasswordChange(passwordData.currentPassword, passwordData.newPassword);
      if (success) {
        setPasswordSuccess(true);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setPasswordSuccess(false);
          setActiveTab('parent');
        }, 2000);
      } else {
        setPasswordErrors(['Le mot de passe actuel est incorrect']);
      }
    } catch (error) {
      setPasswordErrors(['Une erreur est survenue']);
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const languages = [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }];
  const timezones = [{ value: 'Africa/Dakar', label: 'Africa/Dakar (GMT)' }, { value: 'Europe/Paris', label: 'Europe/Paris (GMT+2)' }, { value: 'UTC', label: 'UTC' }];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <div className="bg-white rounded-xl shadow-lg w-full overflow-hidden border border-gray-200">
        
        {/* EN-TÊTE AVEC ONGLETS */}
        <div className="border-b border-gray-200 px-6 py-4">
          {/* (CHANGEMENT : Texte Bleu) */}
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            Gestion du profil
          </h2>
          
          <div className="flex space-x-1">
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'parent'
                  // (CHANGEMENT : Actif Bleu)
                  ? 'bg-blue-600 text-white shadow'
                  // (Hover Jaune est conservé)
                  : 'text-gray-600 hover:text-yellow-900 hover:bg-yellow-100'
              }`}
              onClick={() => setActiveTab('parent')}
            >
              Mon profil
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'password'
                  // (CHANGEMENT : Actif Bleu)
                  ? 'bg-blue-600 text-white shadow'
                  // (Hover Jaune est conservé)
                  : 'text-gray-600 hover:text-yellow-900 hover:bg-yellow-100'
              }`}
              onClick={() => setActiveTab('password')}
            >
              Mot de passe
            </button>
          </div>
        </div>
        
        {/* Onglet "Mon Profil" */}
        {activeTab === 'parent' && (
          <form onSubmit={handleFormSubmit} className="p-6">
            <div className="space-y-6">
              
              {/* --- Section Photo de Profil --- */}
              <div>
                {/* (CHANGEMENT : Texte Bleu) */}
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Photo de profil</h3>
                <div className="flex items-center gap-4">
                  {parentData.avatarUrl ? (
                    <img 
                      src={parentData.avatarUrl} 
                      alt="Profil" 
                      className="w-20 h-20 rounded-full object-cover" 
                    />
                  ) : (
                    // (CHANGEMENT : Avatar Bleu)
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                      {getInitials(parentData.firstName, parentData.lastName)}
                    </div>
                  )}
                  <button
                    type="button"
                    // (Bouton Jaune est conservé)
                    className="px-4 py-2 text-sm font-medium text-yellow-900 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    Changer la photo
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* --- Section Informations de Contact --- */}
              <div>
                {/* (CHANGEMENT : Texte Bleu) */}
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Informations de contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input id="firstName" type="text" name="firstName" value={parentData.firstName} onChange={handleParentChange} required
                      // (CHANGEMENT : Focus Bleu)
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Nom de famille</label>
                    <input id="lastName" type="text" name="lastName" value={parentData.lastName} onChange={handleParentChange} required
                      // (CHANGEMENT : Focus Bleu)
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input id="email" type="email" name="email" value={parentData.email} onChange={handleParentChange} required
                      // (CHANGEMENT : Focus Bleu)
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input id="phone" type="tel" name="phone" value={parentData.phone} onChange={handleParentChange}
                      // (CHANGEMENT : Focus Bleu)
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* --- Section Préférences --- */}
              <div>
                {/* (CHANGEMENT : Texte Bleu) */}
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Préférences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                    <select id="language" name="language" value={parentData.language} onChange={handleParentChange}
                      // (CHANGEMENT : Focus Bleu)
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                    <select id="timezone" name="timezone" value={parentData.timezone} onChange={handleParentChange}
                      // (CHANGEMENT : Focus Bleu)
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* --- Section Notifications --- */}
              <div>
                {/* (CHANGEMENT : Texte Bleu) */}
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Préférences de notification</h3>
                <div className="space-y-3">
                  <label htmlFor="notif-email" className="flex items-center space-x-3">
                    <input id="notif-email" type="checkbox" name="notificationPreferences.email" checked={parentData.notificationPreferences.email} onChange={handleParentChange}
                      // (CHANGEMENT : Checkbox Bleue)
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Notifications par email</span>
                  </label>
                   <label htmlFor="notif-sms" className="flex items-center space-x-3">
                    <input id="notif-sms" type="checkbox" name="notificationPreferences.sms" checked={parentData.notificationPreferences.sms} onChange={handleParentChange}
                      // (CHANGEMENT : Checkbox Bleue)
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Notifications par SMS</span>
                  </label>
                </div>
              </div>
            </div>

            {/* --- Pied de page du formulaire Profil --- */}
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/parent')}
                // (Hover Jaune est conservé)
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-yellow-100 hover:text-yellow-900 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                // (CHANGEMENT : Bouton Bleu)
                className="px-6 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        )}

        {/* Onglet "Mot de passe" */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                {/* (CHANGEMENT : Texte Bleu) */}
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Changer le mot de passe</h3>
                
                {passwordSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    Succès ! Votre mot de passe a été modifié.
                  </div>
                )}
                {passwordErrors.length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <p className="font-medium">Erreur</p>
                    <ul className="list-disc list-inside text-sm">
                      {passwordErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                    <input id="currentPassword" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required
                      // (CHANGEMENT : Focus Bleu)
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                    <input id="newPassword" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required
                      // (CHANGEMENT : Focus Bleu)
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                    <input id="confirmPassword" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required
                      // (CHANGEMENT : Focus Bleu)
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">Exigences :</p>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    <li>Minimum 8 caractères</li>
                    <li>Au moins une majuscule et une minuscule</li>
                    <li>Au moins un chiffre</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* --- Pied de page du formulaire Mot de passe --- */}
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('parent')}
                // (Hover Jaune est conservé)
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-yellow-100 hover:text-yellow-900 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                // (CHANGEMENT : Bouton Bleu)
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  isChangingPassword
                    // (CHANGEMENT : Désactivé Bleu)
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        )}
    </div>
  );
};

export default ProfilParentPage;