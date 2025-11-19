// components/parent/ParentDashboardHome.tsx
//import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

// --- DONNÉES FACTICES POUR L'ACTIVITÉ ---
const mockActivities = [
  { 
    id: 1, icon: '📊', 
    title: 'Nouvelle note en Mathématiques', 
    time: 'il y a 2 heures', 
    link: '/parent/grades' 
  },
  { 
    id: 2, icon: '✓', 
    title: 'Absence signalée pour Ibrahima', 
    time: 'hier, 10:30', 
    link: '/parent/attendance' 
  },
  { 
    id: 3, icon: '💰', 
    title: 'Facture T2 disponible', 
    time: 'il y a 3 jours', 
    link: '/parent/fees' 
  },
];
// ---

export const ParentDashboardHome = () => {
  // L'état de sélection 'selectedChildId' a été supprimé
  const children = [
      { id: 1, name: 'Aminata Diop', class: 'CM1 A', avatar: 'A' },
      { id: 2, name: 'Ibrahima Diop', class: 'CE2 B', avatar: 'I' }
  ];
  // Simule l'enfant sélectionné (ceci viendra d'un Contexte global plus tard)
  const selectedChild = children[0];

  return (
    <div className="dark:text-white transition-colors">
       <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Espace Parent</h1>
            <p className="text-gray-600 dark:text-gray-400">Suivez la scolarité de vos enfants</p>
       </div>
       
         {/* Informations de l'enfant sélectionné */}
         {selectedChild && (
           <>
             <div className="mb-6">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                 {selectedChild.name} - {selectedChild.class}
               </h2>
             </div>
       
             {/* Statistiques rapides (Inchangé) */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                 <div className="p-6 text-white">
                   <p className="text-sm text-white text-opacity-90 mb-1">Moyenne Générale</p>
                   <p className="text-3xl font-bold">--</p>
                   <p className="text-xs text-white text-opacity-75 mt-1">Palier en cours</p>
                 </div>
               </Card>
       
               <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600">
                 <div className="p-6 text-white">
                   <p className="text-sm text-white text-opacity-90 mb-1">Présence</p>
                   <p className="text-3xl font-bold">--%</p>
                   <p className="text-xs text-white text-opacity-75 mt-1">Ce mois</p>
                 </div>
               </Card>
       
               <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500">
                 <div className="p-6 text-white">
                   <p className="text-sm text-white text-opacity-90 mb-1">Frais de scolarité</p>
                   <p className="text-3xl font-bold">--</p>
                   <p className="text-xs text-white text-opacity-75 mt-1">Statut</p>
                 </div>
               </Card>
             </div>
             
             {/* --- Actions rapides (CORRIGÉ) --- */}
             <Card title="Accès Rapide" className="mb-6 border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 
                 {/* Rangée 1 */}
                 <Link to="/parent/grades" className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600">
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">📊</span>
                     <span className="font-semibold text-gray-900 dark:text-white text-center">Notes & Bulletins</span>
                   </div>
                 </Link>
                 
                 <Link to="/parent/attendance" className="p-6 rounded-xl bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900/80 transition-colors border-2 border-transparent hover:border-green-300 dark:hover:border-green-600">
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">✓</span>
                     <span className="font-semibold text-gray-900 dark:text-white text-center">Présences</span>
                   </div>
                 </Link>
                 
                 <Link to="/parent/schedule" className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/80 transition-colors border-2 border-transparent hover:border-yellow-300 dark:hover:border-yellow-600">
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">📅</span>
                     <span className="font-semibold text-gray-900 dark:text-white text-center">Emploi du Temps</span>
                   </div>
                 </Link>
                 
                 <Link to="/parent/fees" className="p-6 rounded-xl bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/80 transition-colors border-2 border-transparent hover:border-red-300 dark:hover:border-red-600">
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">💰</span>
                     <span className="font-semibold text-gray-900 dark:text-white text-center">Frais de Scolarité</span>
                   </div>
                 </Link> { /* <-- FIN DE LA PREMIÈRE ERREUR */ }
                 
                 {/* Rangée 2 */}
                 <Link to="/parent/messages" className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600">
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">💬</span>
                     <span className="font-semibold text-gray-900 dark:text-white text-center">Messages</span>
                   </div>
                 </Link> { /* <-- FIN DE LA DEUXIÈME ERREUR */ }

                 <Link to="/parent/profile" className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600">
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">👤</span>
                     <span className="font-semibold text-gray-900 dark:text-white text-center">Mon Profil</span>
                   </div>
                 </Link> { /* <-- FIN DE LA TROISIÈME ERREUR */ }
                 
                 <Link to="/parent/notification" className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600">
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">🔔</span>
                     <span className="font-semibold text-gray-900 dark:text-white text-center">Notifications</span>
                   </div>
                 </Link> { /* <-- FIN DE LA QUATRIÈME ERREUR */ }
                 
                 <Link to="/parent/settings" className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600">
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">⚙️</span>
                     <span className="font-semibold text-gray-900 dark:text-white text-center">Paramètres</span>
                   </div>
                 </Link> { /* <-- FIN DE LA CINQUIÈME ERREUR */ }

               </div>
             </Card>
             
             {/* Dernières activités (Inchangé) */}
             <Card title="Dernières Activités" className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
               <div className="space-y-3">
                 
                 {mockActivities.length > 0 ? (
                   mockActivities.map(activity => (
                     <Link 
                       to={activity.link} 
                       key={activity.id} 
                       className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors"
                     >
                       <span className="text-2xl">{activity.icon}</span>
                       <div className="flex-1">
                         <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.title}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                       </div>
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                     </Link>
                   ))
                 ) : (
                   <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                     <p className="text-sm text-gray-500 dark:text-gray-400">Aucune activité récente</p>
                   </div>
                 )}
                 
                 <div className="pt-2 text-center">
                    <Link to="/parent/notification" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      Voir toutes les activités
                    </Link>
                 </div>

               </div>
             </Card>
           </>
         )}
    </div>
  );
};