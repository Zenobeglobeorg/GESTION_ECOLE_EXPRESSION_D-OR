import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileSidebar } from '../../components/layout/MobileSidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
//import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import * as userService from '../../services/userService';
import * as studentService from '../../services/studentService';
//import type { UserWithDate } from '../../services/userService';

export const OverviewPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalAdmins: 0,
    totalTeachers: 0,
    totalParents: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [users, students] = await Promise.all([
        userService.getUsers(),
        studentService.getStudents(),
      ]);

      const adminUsers = users.filter(u => u.role === 'ADMINISTRATION');
      const teacherUsers = users.filter(u => u.role === 'TEACHER');
      const parentUsers = users.filter(u => u.role === 'PARENT');

      setStats({
        totalUsers: users.length,
        totalStudents: students.length,
        totalAdmins: adminUsers.length,
        totalTeachers: teacherUsers.length,
        totalParents: parentUsers.length,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      path: '/superadmin/users',
      description: 'Tous les comptes créés',
    },
    {
      title: 'Comptes Administration',
      value: stats.totalAdmins,
      icon: '👔',
      color: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600',
      path: '/superadmin/admins',
      description: 'Membres de l\'administration',
    },
    {
      title: 'Enseignants',
      value: stats.totalTeachers,
      icon: '👨‍🏫',
      color: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
      description: 'Enseignants actifs',
    },
    {
      title: 'Parents',
      value: stats.totalParents,
      icon: '👨‍👩‍👧',
      color: 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700',
      description: 'Familles inscrites',
    },
    {
      title: 'Élèves',
      value: stats.totalStudents,
      icon: '🎓',
      color: 'bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600',
      path: '/superadmin/users',
      description: 'Élèves inscrits',
    },
  ];

  const quickLinks = [
    {
      label: 'Gérer les Utilisateurs',
      path: '/superadmin/users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      label: 'Comptes Administration',
      path: '/superadmin/admins',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      label: 'Inscription Élèves',
      path: '/superadmin/students/new',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    },
    {
      label: 'Rôles & Permissions',
      path: '/superadmin/roles',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Vue Globale du Système</h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Super-Administrateur
              </span>
            </div>
            <p className="text-gray-600">Vue d'ensemble complète de tous les éléments du système</p>
          </div>

          {/* Statistiques principales */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des statistiques...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {statCards.map((stat, index) => (
                  <Link key={index} to={stat.path || '#'} className="block">
                    <Card
                      className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-0 ${stat.color} transform hover:scale-105`}
                    >
                      <div className="p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-2xl">
                            {stat.icon}
                          </div>
                        </div>
                        <p className="text-white text-opacity-90 text-sm mb-1 font-medium">{stat.title}</p>
                        <p className="text-3xl font-bold mb-1">{stat.value}</p>
                        <p className="text-xs text-white text-opacity-75">{stat.description}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Accès rapides */}
              <Card
                title="Accès Rapides"
                className="mb-8 border-0 shadow-lg"
                headerActions={
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickLinks.map((link, index) => (
                    <Link key={index} to={link.path} className="block">
                      <div
                        className={`${link.color} p-6 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-yellow-300`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div>{link.icon}</div>
                          <span className="font-semibold text-center">{link.label}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>

              {/* Informations système */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                  title="État du Système"
                  className="border-0 shadow-lg"
                  headerActions={
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Système</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Opérationnel
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Base de données</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Connectée
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Services email</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Configuré
                      </span>
                    </div>
                  </div>
                </Card>

                <Card
                  title="Résumé des Activités"
                  className="border-0 shadow-lg"
                  headerActions={
                    <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <svg className="w-6 h-6" style={{ color: '#fbbf24' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  }
                >
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Utilisateurs actifs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Élèves inscrits</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Taux d'inscription</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalUsers > 0 
                          ? Math.round((stats.totalStudents / stats.totalUsers) * 100) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

