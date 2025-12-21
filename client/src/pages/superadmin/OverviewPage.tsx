import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileSidebar } from '../../components/layout/MobileSidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
//import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import * as userService from '../../services/userService';
import * as studentService from '../../services/studentService';
import { useLanguage } from '../../contexts/LanguageContext';
//import type { UserWithDate } from '../../services/userService';

export const OverviewPage = () => {
  const { t } = useLanguage();
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
      title: t('overview.totalUsers'),
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      path: '/superadmin/users',
      description: t('overview.allAccounts'),
    },
    {
      title: t('overview.adminAccounts'),
      value: stats.totalAdmins,
      icon: '👔',
      color: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600',
      path: '/superadmin/admins',
      description: t('overview.adminMembers'),
    },
    {
      title: t('overview.teachers'),
      value: stats.totalTeachers,
      icon: '👨‍🏫',
      color: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
      description: t('overview.activeTeachers'),
    },
    {
      title: t('overview.parents'),
      value: stats.totalParents,
      icon: '👨‍👩‍👧',
      color: 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700',
      description: t('overview.registeredFamilies'),
    },
    {
      title: t('overview.students'),
      value: stats.totalStudents,
      icon: '🎓',
      color: 'bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600',
      path: '/superadmin/users',
      description: t('overview.registeredStudents'),
    },
  ];

  const quickLinks = [
    {
      label: t('overview.manageUsers'),
      path: '/superadmin/users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      label: t('overview.adminAccountsLink'),
      path: '/superadmin/admins',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      label: t('overview.studentRegistration'),
      path: '/superadmin/students/new',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    },
    {
      label: t('overview.rolesPermissions'),
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('overview.title')}</h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                {t('dashboard.superAdmin')}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{t('overview.subtitle')}</p>
          </div>

          {/* Statistiques principales */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('overview.loadingStats')}</p>
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
                title={t('overview.quickAccess')}
                className="mb-8 border-0 shadow-lg dark:bg-gray-800"
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
                  title={t('overview.systemStatus')}
                  className="border-0 shadow-lg dark:bg-gray-800"
                  headerActions={
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{t('overview.system')}</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        {t('overview.operational')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{t('overview.database')}</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        {t('overview.connected')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{t('overview.emailServices')}</span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                        {t('overview.configured')}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card
                  title={t('overview.activitySummary')}
                  className="border-0 shadow-lg dark:bg-gray-800"
                  headerActions={
                    <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  }
                >
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('overview.activeUsers')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('overview.registeredStudents')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('overview.enrollmentRate')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
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

