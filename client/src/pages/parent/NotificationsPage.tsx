// Enregistrez ce fichier sous: src/pages/parent/NotificationsPage.tsx

import React, { useState, useMemo } from 'react';

// --- DONNÉES FACTICES (MOCK DATA) ---
type Notification = {
  id: string;
  type: 'note' | 'facture' | 'absence' | 'info';
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  { 
    id: '1', type: 'note', 
    title: 'Nouvelle note disponible', 
    description: 'Une nouvelle note a été ajoutée en Mathématiques pour Aminata.', 
    time: 'il y a 2 heures', read: false 
  },
  { 
    id: '2', type: 'facture', 
    title: 'Facture de scolarité', 
    description: 'La facture pour la Tranche 2 est maintenant disponible.', 
    time: 'il y a 1 jour', read: false 
  },
  { 
    id: '3', type: 'absence', 
    title: 'Absence non justifiée', 
    description: 'Ibrahima a été marqué absent le 13/11 à 10h00.', 
    time: 'il y a 2 jours', read: true 
  },
  { 
    id: '4', type: 'info', 
    title: 'Réunion Parents-Professeurs', 
    description: 'La réunion aura lieu le 20 Décembre. Plus d\'infos...', 
    time: 'il y a 1 semaine', read: true 
  },
];

// Icônes pour chaque type
const notificationIcons = {
  note: '📊',
  facture: '💰',
  absence: '✓',
  info: '🔔',
};
// ---

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Filtre les notifications basées sur l'onglet actif
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  // Marque toutes les notifications comme lues
  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map(n => ({ ...n, read: true }))
    );
  };

  return (
    // (Style : Conteneur principal blanc/sombre, comme ProfilParentPage)
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
        
        {/* EN-TÊTE AVEC ONGLETS ET ACTIONS */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
            {/* (Style : Titre Bleu) */}
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">
              Centre de Notifications
            </h2>
            <button 
              onClick={handleMarkAllAsRead}
              className="mt-2 sm:mt-0 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              Tout marquer comme lu
            </button>
          </div>
          
          {/* Onglets (Style : Bleu/Jaune de SidebarParent) */}
          <div className="flex space-x-1">
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-yellow-900 hover:bg-yellow-100 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('all')}
            >
              Toutes
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'unread'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-yellow-900 hover:bg-yellow-100 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('unread')}
            >
              Non lues
            </button>
          </div>
        </div>

        {/* --- Liste des Notifications --- */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                // (Style : Hover Jaune pour l'interactivité)
                className="flex items-start gap-4 p-6 transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
              >
                {/* Icône */}
                <span className="text-2xl mt-1">{notificationIcons[notification.type]}</span>
                
                {/* Contenu */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notification.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                </div>

                {/* Point "Non lu" */}
                {!notification.read && (
                  <span className="flex-shrink-0 w-3 h-3 mt-1.5 bg-blue-500 rounded-full" title="Non lu"></span>
                )}
              </div>
            ))
          ) : (
            // --- État Vide ---
            <div className="p-12 text-center">
              <span className="text-5xl">🎉</span>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">Tout est à jour !</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {activeTab === 'unread' 
                  ? 'Vous avez lu toutes vos notifications.' 
                  : 'Vous n\'avez pas encore de notification.'}
              </p>
            </div>
          )}
        </div>

    </div>
  );
};

export default NotificationsPage;