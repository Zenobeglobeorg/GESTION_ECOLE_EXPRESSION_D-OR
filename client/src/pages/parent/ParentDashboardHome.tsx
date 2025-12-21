// components/parent/ParentDashboardHome.tsx
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import * as attendanceService from '../../services/attendanceService';
import * as feesService from '../../services/feesService';
import * as gradeService from '../../services/gradeService';

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
  const { selectedChild, children, setSelectedChild } = useSelectedChild();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageGrade: null as number | null,
    attendanceRate: null as number | null,
    feesStatus: '--' as string,
  });

  // Charger les statistiques pour l'enfant sélectionné
  useEffect(() => {
    const loadStats = async () => {
      if (!selectedChild) {
        console.log('ParentDashboardHome: Aucun enfant sélectionné');
        setLoading(false);
        return;
      }

      console.log('ParentDashboardHome: Chargement des statistiques pour l\'élève:', selectedChild.id);

      try {
        setLoading(true);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        console.log('ParentDashboardHome: Période:', monthStart, 'à', monthEnd);

        // Charger les données en parallèle avec gestion d'erreur détaillée
        let grades: gradeService.Grade[] = [];
        let attendances = { present: 0, total: 0 };
        let payments: feesService.Payment[] = [];

        try {
          grades = await gradeService.getMyChildrenGrades();
          console.log('ParentDashboardHome: Notes chargées:', grades.length);
        } catch (err) {
          console.error('ParentDashboardHome: Erreur lors du chargement des notes:', err);
        }

        try {
          attendances = await attendanceService.getMyChildrenAttendanceStats({
            studentId: selectedChild.id,
            startDate: monthStart,
            endDate: monthEnd,
          });
          console.log('ParentDashboardHome: Présences chargées:', attendances);
        } catch (err) {
          console.error('ParentDashboardHome: Erreur lors du chargement des présences:', err);
        }

        try {
          payments = await feesService.getStudentPayments(selectedChild.id);
          console.log('ParentDashboardHome: Paiements chargés:', payments.length);
        } catch (err) {
          console.error('ParentDashboardHome: Erreur lors du chargement des paiements:', err);
        }

        // Calculer la moyenne générale
        const childGrades = grades.filter((g) => g.student?.id === selectedChild.id);
        console.log('ParentDashboardHome: Notes de l\'enfant:', childGrades.length, childGrades);
        let averageGrade = null;
        if (childGrades.length > 0) {
          // Calculer la moyenne en utilisant le champ grade (sur 20) ou score (sur 10)
          const validGrades = childGrades.filter((g) => {
            const hasGrade = g.grade != null && !isNaN(g.grade);
            const hasScore = g.score != null && !isNaN(g.score);
            return hasGrade || hasScore;
          });
          
          if (validGrades.length > 0) {
            const total = validGrades.reduce((sum: number, g) => {
              // Utiliser grade (sur 20) si disponible, sinon score (sur 10)
              // Convertir en sur 10 pour l'affichage
              const note = g.grade != null ? g.grade / 2 : (g.score || 0);
              return sum + note;
            }, 0);
            averageGrade = Math.round((total / validGrades.length) * 10) / 10;
            console.log('ParentDashboardHome: Moyenne calculée:', averageGrade, 'sur', validGrades.length, 'notes');
          } else {
            console.log('ParentDashboardHome: Aucune note valide trouvée');
          }
        } else {
          console.log('ParentDashboardHome: Aucune note trouvée pour cet enfant');
        }

        // Calculer le taux de présence
        const attendanceRate = attendances.total > 0 
          ? Math.round((attendances.present / attendances.total) * 100)
          : null;
        console.log('ParentDashboardHome: Taux de présence:', attendanceRate);

        // Calculer le statut des frais
        let feesStatus = '--';
        if (payments.length > 0) {
          const total = payments.reduce((sum, p) => sum + p.amount, 0);
          const paid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
          const pending = total - paid;
          if (pending === 0) {
            feesStatus = 'Payé';
          } else {
            feesStatus = `${Math.round((paid / total) * 100)}%`;
          }
          console.log('ParentDashboardHome: Statut des frais:', feesStatus, '(Total:', total, ', Payé:', paid, ')');
        }

        setStats({
          averageGrade,
          attendanceRate,
          feesStatus,
        });
      } catch (err) {
        console.error('ParentDashboardHome: Erreur générale lors du chargement des statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedChild]);

  if (!selectedChild) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-2">Espace Parent</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Veuillez sélectionner un enfant pour voir son tableau de bord.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:text-white transition-colors">
       <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Espace Parent</h1>
            <p className="text-gray-600 dark:text-gray-400">Suivez la scolarité de vos enfants</p>
       </div>

       {/* Sélection d'enfant */}
       {children.length > 1 && (
         <Card className="mb-6 border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
           <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sélectionner un enfant :</p>
           <div className="flex gap-3">
             {children.map((child) => (
               <button
                 key={child.id}
                 onClick={() => setSelectedChild(child)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                   selectedChild?.id === child.id
                     ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600'
                     : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                 }`}
               >
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold">
                   {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                 </div>
                 <div className="text-left">
                   <p className="font-semibold text-gray-900 dark:text-white">{child.firstName} {child.lastName}</p>
                   <p className="text-xs text-gray-600 dark:text-gray-400">{child.class?.name || '--'}</p>
                 </div>
               </button>
             ))}
           </div>
         </Card>
       )}
       
         {/* Informations de l'enfant sélectionné */}
         {selectedChild && (
           <>
             <div className="mb-6">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                 {selectedChild.firstName} {selectedChild.lastName} - {selectedChild.class?.name || '--'}
               </h2>
             </div>
       
             {/* Statistiques rapides */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                 <div className="p-6 text-white">
                   <p className="text-sm text-white text-opacity-90 mb-1">Moyenne Générale</p>
                   <p className="text-3xl font-bold">{loading ? '--' : (stats.averageGrade !== null ? stats.averageGrade.toFixed(1) : '--')}</p>
                   <p className="text-xs text-white text-opacity-75 mt-1">Palier en cours</p>
                 </div>
               </Card>
       
               <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600">
                 <div className="p-6 text-white">
                   <p className="text-sm text-white text-opacity-90 mb-1">Présence</p>
                   <p className="text-3xl font-bold">{loading ? '--' : (stats.attendanceRate !== null ? `${stats.attendanceRate}%` : '--')}</p>
                   <p className="text-xs text-white text-opacity-75 mt-1">Ce mois</p>
                 </div>
               </Card>
       
               <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500">
                 <div className="p-6 text-white">
                   <p className="text-sm text-white text-opacity-90 mb-1">Frais de scolarité</p>
                   <p className="text-3xl font-bold">{loading ? '--' : stats.feesStatus}</p>
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