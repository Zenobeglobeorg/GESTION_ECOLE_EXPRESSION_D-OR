import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import * as dashboardService from '../../services/dashboardService';

export const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    teachers: 0,
    pendingPayments: { count: 0, amount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statsDisplay = [
    {
      title: 'Élèves',
      value: loading ? '--' : stats.students.toString(),
      icon: '🎓',
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
      description: 'Élèves inscrits'
    },
    {
      title: 'Classes',
      value: loading ? '--' : stats.classes.toString(),
      icon: '📚',
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
      description: 'Classes actives'
    },
    {
      title: 'Enseignants',
      value: loading ? '--' : stats.teachers.toString(),
      icon: '👨‍🏫',
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
      description: 'Enseignants actifs'
    },
    {
      title: 'Frais en attente',
      value: loading ? '--' : stats.pendingPayments.count.toString(),
      icon: '💰',
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
      description: `${stats.pendingPayments.amount.toLocaleString('fr-FR')} FCFA`
    }
  ];

  const quickActions = [
    { label: 'Inscrire un élève', path: '/admin/students/new', icon: '➕' },
    { label: 'Gérer les classes', path: '/admin/classes', icon: '📚' },
    { label: 'Valider les notes', path: '/admin/grades', icon: '✅' },
    { label: 'Générer les bulletins', path: '/admin/reports', icon: '📊' }
  ];

  return (
    <AdminLayout
      title="Tableau de Bord"
      subtitle="Bienvenue dans votre espace d'administration"
    >
      <ProtectedContent permission="users.read" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission d'accéder au tableau de bord.
        </div>
      }>
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat, index) => (
          <Card
            key={index}
            className={`overflow-hidden hover:shadow-xl transition-all border-0 bg-gradient-to-br ${stat.gradient} text-white`}
          >
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                  {stat.icon}
                </div>
              </div>
              <p className="text-white text-opacity-90 text-sm mb-1 font-medium">{stat.title}</p>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-white text-opacity-75">{stat.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card
        title="Actions Rapides"
        className="border-0 shadow-lg"
        headerActions={<div className="w-1 h-8 rounded-full bg-yellow-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="group block p-6 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-yellow-50 transition-all hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-3xl text-blue-700 group-hover:text-yellow-700 transition-colors">{action.icon}</span>
                <span className="font-semibold text-blue-900 group-hover:text-yellow-800">
                  {action.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card
        title="Informations Importantes"
        className="border-0 shadow-lg"
        headerActions={<div className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">À traiter</div>}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-gray-900">Notes en attente de validation</p>
              <p className="text-xs text-gray-600">Des notes ont été saisies et nécessitent votre validation</p>
            </div>
          </div>
        </div>
      </Card>
      </ProtectedContent>
    </AdminLayout>
  );
};

