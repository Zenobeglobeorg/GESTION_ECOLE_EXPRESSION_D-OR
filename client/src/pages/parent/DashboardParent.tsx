import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { SidebarParent } from '../../components/parent/SidebarParent';
import { MobileSidebarParent } from '../../components/parent/MobileSidebarParent';
import { Card } from '../../components/ui/Card';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import { useAuth } from '../../hooks/useAuth';
import * as studentService from '../../services/studentService';
import * as attendanceService from '../../services/attendanceService';
import * as feesService from '../../services/feesService';
import * as gradeService from '../../services/gradeService';

export const DashboardParent = () => {
  const { user } = useAuth();
  const { selectedChild, children, setSelectedChild, setChildren, loading: childrenLoading, setLoading: setChildrenLoading } = useSelectedChild();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageGrade: null as number | null,
    attendanceRate: null as number | null,
    feesStatus: '--' as string,
  });

  // Charger les enfants si le contexte ne les a pas encore chargés
  useEffect(() => {
    const loadChildrenIfNeeded = async () => {
      if (!user || user.role !== 'PARENT') return;
      
      // Si les enfants ne sont pas encore chargés, les charger
      if (children.length === 0 && !childrenLoading) {
        console.log('DashboardParent: Chargement des enfants...');
        try {
          setChildrenLoading(true);
          const students = await studentService.getStudentsByParent(user.id);
          console.log('DashboardParent: Enfants chargés:', students.length);
          setChildren(students);
          
          // Sélectionner le premier enfant par défaut
          if (students.length > 0 && !selectedChild) {
            console.log('DashboardParent: Sélection automatique du premier enfant:', students[0]);
            setSelectedChild(students[0]);
          }
        } catch (error) {
          console.error('DashboardParent: Erreur lors du chargement des enfants:', error);
        } finally {
          setChildrenLoading(false);
        }
      }
    };

    loadChildrenIfNeeded();
  }, [user, children.length, childrenLoading, selectedChild, setChildren, setSelectedChild, setChildrenLoading]);

  // Attendre que les enfants soient chargés et sélectionner le premier si aucun n'est sélectionné
  useEffect(() => {
    console.log('DashboardParent: État du contexte -', {
      childrenLoading,
      childrenCount: children.length,
      selectedChildId: selectedChild?.id,
      selectedChildName: selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : null,
    });

    if (!childrenLoading && children.length > 0 && !selectedChild) {
      console.log('DashboardParent: Sélection automatique du premier enfant:', children[0]);
      setSelectedChild(children[0]);
    }
  }, [childrenLoading, children, selectedChild, setSelectedChild]);

  // Charger les statistiques pour l'enfant sélectionné
  useEffect(() => {
    const loadStats = async () => {
      if (!selectedChild) {
        console.log('DashboardParent: Aucun enfant sélectionné');
        setLoading(false);
        return;
      }

      console.log('DashboardParent: Chargement des statistiques pour l\'élève:', selectedChild.id);

      try {
        setLoading(true);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        console.log('DashboardParent: Période:', monthStart, 'à', monthEnd);

        // Charger les données en parallèle avec gestion d'erreur détaillée
        let grades: gradeService.Grade[] = [];
        let attendances = { present: 0, total: 0 };
        let payments: feesService.Payment[] = [];

        try {
          grades = await gradeService.getMyChildrenGrades();
          console.log('DashboardParent: Notes chargées:', grades.length);
        } catch (err) {
          console.error('DashboardParent: Erreur lors du chargement des notes:', err);
        }

        try {
          attendances = await attendanceService.getMyChildrenAttendanceStats({
            studentId: selectedChild.id,
            startDate: monthStart,
            endDate: monthEnd,
          });
          console.log('DashboardParent: Présences chargées:', attendances);
        } catch (err) {
          console.error('DashboardParent: Erreur lors du chargement des présences:', err);
        }

        try {
          payments = await feesService.getStudentPayments(selectedChild.id);
          console.log('DashboardParent: Paiements chargés:', payments.length);
        } catch (err) {
          console.error('DashboardParent: Erreur lors du chargement des paiements:', err);
        }

        // Calculer la moyenne générale
        const childGrades = grades.filter((g) => g.student?.id === selectedChild.id);
        console.log('DashboardParent: Notes de l\'enfant:', childGrades.length, childGrades);
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
            console.log('DashboardParent: Moyenne calculée:', averageGrade, 'sur', validGrades.length, 'notes');
          } else {
            console.log('DashboardParent: Aucune note valide trouvée');
          }
        } else {
          console.log('DashboardParent: Aucune note trouvée pour cet enfant');
        }

        // Calculer le taux de présence
        const attendanceRate = attendances.total > 0 
          ? Math.round((attendances.present / attendances.total) * 100)
          : null;
        console.log('DashboardParent: Taux de présence:', attendanceRate);

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
          console.log('DashboardParent: Statut des frais:', feesStatus, '(Total:', total, ', Payé:', paid, ')');
        }

        setStats({
          averageGrade,
          attendanceRate,
          feesStatus,
        });
      } catch (err) {
        console.error('DashboardParent: Erreur générale lors du chargement des statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedChild]);

  // Afficher un message de chargement pendant que les enfants sont chargés
  if (childrenLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SidebarParent isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <MobileSidebarParent isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chargement des informations...
                </p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Si aucun enfant n'est disponible
  if (!selectedChild && children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SidebarParent isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <MobileSidebarParent isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-2">Espace Parent</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Aucun enfant trouvé. Veuillez contacter l'administration.
                </p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Si aucun enfant n'est sélectionné mais qu'il y en a dans la liste
  if (!selectedChild && children.length > 0) {
    console.log('DashboardParent: Enfants disponibles mais aucun sélectionné, sélection du premier');
    // Ce cas ne devrait pas arriver grâce au useEffect ci-dessus, mais on le gère quand même
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SidebarParent isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <MobileSidebarParent isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sélection de l'enfant...
                </p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarParent isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebarParent isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
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
          {selectedChild ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedChild.firstName} {selectedChild.lastName} - {selectedChild.class?.name || '--'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {selectedChild.id} | Classe ID: {selectedChild.class?.id || 'N/A'}
                </p>
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

              {/* Actions rapides */}
              <Card title="Accès Rapide" className="mb-6 border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Link to="/parent/fees" className="p-6 rounded-xl bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900/80 transition-colors border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-3xl">💰</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-center">Frais de Scolarité</span>
                    </div>
                  </Link>
                </div>
              </Card>

              {/* Dernières activités */}
              <Card title="Dernières Activités" className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucune activité récente</p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="mb-6">
              <p className="text-red-600 dark:text-red-400">
                Erreur: selectedChild est null alors qu'il devrait être défini
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enfants disponibles: {children.length}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

