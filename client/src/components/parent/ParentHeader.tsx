import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { useMessageCount } from '../../hooks/useMessageCount';
import { useNavigate } from 'react-router-dom';
import * as studentService from '../../services/studentService';
import * as feesService from '../../services/feesService';

interface ParentHeaderProps {
  isSidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export const ParentHeader = ({ isSidebarCollapsed, onMobileMenuToggle }: ParentHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedChild, setSelectedChild, children, setChildren, setLoading } = useSelectedChild();
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const { unreadCount: notificationCount } = useNotificationCount();
  const { unreadCount: messageCount } = useMessageCount();
  const [upcomingPayments, setUpcomingPayments] = useState<feesService.Payment[]>([]);
  const [paymentWarning, setPaymentWarning] = useState<{ color: string; message: string } | null>(null);
  
  // Charger les enfants du parent connecté
  useEffect(() => {
    const loadChildren = async () => {
      if (!user || user.role !== 'PARENT') return;
      
      try {
        setLoading(true);
        const students = await studentService.getStudentsByParent(user.id);
        setChildren(students);
        
        // Sélectionner le premier enfant par défaut s'il n'y en a pas de sélectionné
        if (students.length > 0 && !selectedChild) {
          setSelectedChild(students[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des enfants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChildren();
  }, [user, setChildren, setSelectedChild, setLoading, selectedChild]);

  // Charger les échéances de paiement pour tous les enfants
  useEffect(() => {
    const loadPayments = async () => {
      if (!user || user.role !== 'PARENT' || children.length === 0) return;
      
      try {
        const allPayments: feesService.Payment[] = [];
        for (const child of children) {
          try {
            const payments = await feesService.getStudentPayments(child.id);
            allPayments.push(...payments.filter(p => p.status !== 'PAID'));
          } catch (err) {
            console.error(`Erreur lors du chargement des paiements pour ${child.firstName}:`, err);
          }
        }
        
        // Trier par date d'échéance (plus proche en premier)
        allPayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        // Prendre les 3 prochaines échéances
        setUpcomingPayments(allPayments.slice(0, 3));
        
        // Calculer le statut de paiement pour l'avertissement
        if (allPayments.length > 0) {
          const nextPayment = allPayments[0];
          const dueDate = new Date(nextPayment.dueDate);
          const today = new Date();
          // Date limite : 5 mars de l'année en cours (ou suivante si déjà passé)
          const currentYear = today.getFullYear();
          let finalDate = new Date(currentYear, 2, 5); // 5 mars (mois 2 = mars)
          if (today > finalDate) {
            finalDate = new Date(currentYear + 1, 2, 5);
          }
          
          // Calculer les jours jusqu'à l'échéance
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const daysUntilFinal = Math.ceil((finalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Si on est en février ou après, et qu'on approche du 5 mars
          const currentMonth = today.getMonth() + 1; // 1-12
          
          if (daysUntilFinal < 0) {
            // Après le 5 mars - ROUGE
            setPaymentWarning({
              color: 'red',
              message: '⚠️ Date limite dépassée - Compte bloqué',
            });
          } else if (currentMonth >= 2 && daysUntilFinal <= 30) {
            // Février ou mars, moins de 30 jours - ROUGE
            setPaymentWarning({
              color: 'red',
              message: `⚠️ ${daysUntilFinal} jour${daysUntilFinal > 1 ? 's' : ''} avant la date limite`,
            });
          } else if (currentMonth >= 2 && daysUntilFinal <= 60) {
            // Février, moins de 60 jours - JAUNE
            setPaymentWarning({
              color: 'yellow',
              message: `⏰ ${daysUntilFinal} jour${daysUntilFinal > 1 ? 's' : ''} avant la date limite`,
            });
          } else if (daysUntilDue <= 7) {
            // Moins de 7 jours jusqu'à la prochaine échéance - JAUNE
            setPaymentWarning({
              color: 'yellow',
              message: `⏰ Échéance dans ${daysUntilDue} jour${daysUntilDue > 1 ? 's' : ''}`,
            });
          } else {
            // Tout va bien - VERT
            setPaymentWarning({
              color: 'green',
              message: `✓ Prochaine échéance: ${dueDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`,
            });
          }
        } else {
          setPaymentWarning(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paiements:', error);
      }
    };
    
    if (children.length > 0) {
      loadPayments();
    }
  }, [user, children]);
  
  const handleSelectChild = (child: studentService.Student) => {
    setSelectedChild(child);
    setIsChildDropdownOpen(false);
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    // AJOUT: dark:bg-gray-800 dark:border-gray-700
    <header className={`fixed top-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ${
      isSidebarCollapsed ? 'lg:left-28' : 'lg:left-64'
    } left-0`}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        
        <div className="hidden lg:block">
          {/* AJOUT: dark:text-blue-400 */}
          <p className="text-md font-semibold text-blue-800 dark:text-blue-400">
            Bienvenue, {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Espace Parent</p>
        </div>

        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            aria-label="Ouvrir le menu"
            title="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-blue-700 dark:text-blue-400">
            Expression d'Or
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Avertissement de paiement */}
          {paymentWarning && (
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
              paymentWarning.color === 'red' 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                : paymentWarning.color === 'yellow'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
            }`}>
              {paymentWarning.message}
            </div>
          )}
          
          {/* Cloche de notification */}
          <button
            onClick={() => navigate('/parent/notification')}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            aria-label="Notifications"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Messages */}
          <button
            onClick={() => navigate('/parent/messages')}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            aria-label="Messages"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {messageCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {messageCount > 9 ? '9+' : messageCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          {selectedChild ? (
            <>
              <button
                onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
                // AJOUT: dark:hover:bg-gray-700
                className="flex items-center gap-2 px-2 py-1 md:px-4 md:py-2 rounded-lg transition-colors hover:bg-yellow-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm md:text-base">
                  {getInitials(selectedChild.firstName, selectedChild.lastName)}
                </div>
                <div className="text-left hidden md:block">
                  {/* AJOUT: dark:text-white */}
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedChild.class?.name || 'Non assigné'}
                  </p>
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${isChildDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isChildDropdownOpen && children.length > 0 && (
                // AJOUT: dark:bg-gray-800 dark:border-gray-700
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                  <p className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">Changer d'enfant</p>
                  <div className="p-2">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleSelectChild(child)}
                        // AJOUT: dark:hover:bg-gray-700
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left hover:bg-yellow-100 dark:hover:bg-gray-700 ${
                          selectedChild?.id === child.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(child.firstName, child.lastName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {child.firstName} {child.lastName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {child.class?.name || 'Non assigné'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Aucun enfant
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};