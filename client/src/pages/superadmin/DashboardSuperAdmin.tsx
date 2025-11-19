import { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileSidebar } from '../../components/layout/MobileSidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const DashboardSuperAdmin = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const stats = [
    {
      title: 'Comptes Administration',
      value: '0',
      icon: '👥',
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
      description: 'Comptes créés',
      change: '+0%',
    },
    {
      title: 'Enseignants',
      value: '0',
      icon: '👨‍🏫',
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      description: 'Enseignants actifs',
      change: '+0%',
    },
    {
      title: 'Parents',
      value: '0',
      icon: '👨‍👩‍👧',
      gradient: 'from-yellow-500 via-yellow-600 to-yellow-700',
      description: 'Familles inscrites',
      change: '+0%',
    },
    {
      title: 'Élèves',
      value: '0',
      icon: '🎓',
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
      description: 'Élèves inscrits',
      change: '+0%',
    },
  ];

  const quickActions = [
    {
      label: 'Inscrire un élève',
      path: '/superadmin/students/new',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    },
    {
      label: 'Gérer les utilisateurs',
      path: '/superadmin/users',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
    {
      label: 'Gérer les rôles',
      path: '/superadmin/roles',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    },
    {
      label: 'Vue globale',
      path: '/superadmin/overview',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
  ];

  const recentActivities = [
    {
      type: 'user',
      message: 'Aucune activité récente',
      time: 'Le système est prêt',
      icon: '👤',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      {/* Sidebar Mobile */}
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Navbar */}
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête avec badge */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Super-Administrateur
              </span>
            </div>
            <p className="text-gray-600">Bienvenue dans votre espace de gestion complète du système</p>
          </div>

          {/* Statistiques avec design amélioré */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br ${stat.gradient} transform hover:scale-105`}
              >
                <div className="p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-2xl">
                      {stat.icon}
                    </div>
                    <span className="text-xs font-semibold bg-opacity-20 backdrop-blur-sm px-2 py-1 rounded">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-white text-opacity-90 text-sm mb-1 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-white text-opacity-75">{stat.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Actions rapides avec design jaune/bleu */}
          <Card
            title="Actions Rapides"
            className="mb-8 border-0 shadow-lg"
            headerActions={
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path} className="block">
                  <div
                    className={`${action.color} p-6 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-yellow-300`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div>{action.icon}</div>
                      <span className="font-semibold text-center">{action.label}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Grille de contenu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gestion des comptes */}
            <Card
              title="Gestion des Utilisateurs"
              className="border-0 shadow-lg"
              headerActions={
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              }
            >
              <p className="text-gray-600 mb-4">
                Créez et gérez tous les utilisateurs du système (Admin, Enseignants, Parents)
              </p>
              <Link to="/superadmin/users" className="block">
                <Button
                  variant="primary"
                  className="w-full"
                  style={{ backgroundColor: '#1e40af' }}
                >
                  Gérer les Utilisateurs
                </Button>
              </Link>
            </Card>

            {/* Rôles et Permissions */}
            <Card
              title="Rôles et Permissions"
              className="border-0 shadow-lg"
              headerActions={
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <svg className="w-6 h-6" style={{ color: '#fbbf24' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              }
            >
              <p className="text-gray-600 mb-4">
                Définissez avec précision les droits d'accès de chaque membre de l'administration
              </p>
              <Link to="/superadmin/roles">
                <Button
                  variant="primary"
                  className="w-full"
                  style={{ backgroundColor: '#fbbf24' }}
                >
                  Gérer les Rôles
                </Button>
              </Link>
            </Card>

            {/* Vue Globale */}
            <Card
              title="Vue Globale du Système"
              className="border-0 shadow-lg"
              headerActions={
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              }
            >
              <p className="text-gray-600 mb-4">
                Accédez à toutes les données et modules du système avec un contrôle total
              </p>
              <Link to="/superadmin/overview">
                <Button
                  variant="primary"
                  className="w-full"
                  style={{ backgroundColor: '#1e40af' }}
                >
                  Accéder à la Vue Globale
                </Button>
              </Link>
            </Card>

            {/* Activités Récentes */}
            <Card
              title="Activités Récentes"
              className="border-0 shadow-lg"
              headerActions={
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <svg className="w-6 h-6" style={{ color: '#fbbf24' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
            >
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-yellow-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
