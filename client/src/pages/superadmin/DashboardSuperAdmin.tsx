import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileSidebar } from '../../components/layout/MobileSidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
//import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import * as dashboardService from '../../services/dashboardService';

export const DashboardSuperAdmin = () => {
  const { t } = useLanguage();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    admins: 0,
    teachers: 0,
    parents: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getSuperAdminStats();
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
    { title: t('dashboard.adminAccounts'), value: loading ? '--' : stats.admins.toString(), icon: '👥', description: t('overview.allAccounts') },
    { title: t('dashboard.teachers'), value: loading ? '--' : stats.teachers.toString(), icon: '👨‍🏫', description: t('overview.activeTeachers') },
    { title: t('dashboard.parents'), value: loading ? '--' : stats.parents.toString(), icon: '👨‍👩‍👧', description: t('overview.registeredFamilies') },
    { title: t('dashboard.students'), value: loading ? '--' : stats.students.toString(), icon: '🎓', description: t('overview.registeredStudents') },
  ];

  const quickActions = [
    {
      label: t('dashboard.registerStudent'),
      path: '/superadmin/students/new',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    },
    {
      label: t('dashboard.manageUsers'),
      path: '/superadmin/users',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    },
    {
      label: t('dashboard.manageRoles'),
      path: '/superadmin/roles',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    },
    // {
    //   label: t('dashboard.globalView'),
    //   path: '/superadmin/overview',
    //   icon: (
    //     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    //     </svg>
    //   ),
    //   color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    // },
    {
      label: t('dashboard.adminView'),
      path: '/admin',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    },
    {
      label: t('dashboard.teacherView'),
      path: '/teacher',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    },
  ];

  //const recentActivities = [
  //  {
  //    type: 'user',
  //    message: t('dashboard.noRecentActivity'),
  //    time: t('dashboard.systemReady'),
  //    icon: '👤',
  //  },
  //];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                {t('dashboard.superAdmin')}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{t('dashboard.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          {/* Statistiques – cartes compactes jaunes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {statsDisplay.map((stat, index) => (
              <div
                key={index}
                className="rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-4 text-white shadow-md hover:shadow-lg transition-shadow border border-yellow-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center text-lg shrink-0">
                    {stat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-bold leading-tight">{stat.value}</p>
                    <p className="text-xs font-medium text-white/95 truncate" title={stat.title}>{stat.title}</p>
                    <p className="text-[11px] text-white/80 truncate" title={stat.description}>{stat.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions rapides avec design jaune/bleu */}
            <Card
              title={t('dashboard.quickActions')}
              className="mb-8 border-0 shadow-lg dark:bg-gray-800"
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
        </div>
      </main>
    </div>
  );
};
