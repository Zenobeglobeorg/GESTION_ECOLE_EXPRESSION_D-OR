import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface SidebarTeacherProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarTeacher = ({ isCollapsed, onToggle }: SidebarTeacherProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const menuItems: MenuItem[] = [
    {
      label: t('teacher.dashboard') || 'Tableau de Bord',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/teacher',
    },
    {
      label: t('teacher.myClasses') || 'Mes Classes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      path: '/teacher/classes',
    },
    {
      label: t('grades.fillGrades') || 'Remplir Notes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: '/teacher/RemplitNote',
    },
    {
      label: t('teacher.gradeBook') || 'Carnet de Notes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: '/teacher/CarnetNote',
    },
    {
      label: t('teacher.attendance') || 'Présences',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/teacher/Presence',
    },
    {
      label: t('teacher.attendanceSheet') || 'Fiche Présence',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      path: '/teacher/FichePresence',
    },
    {
      label: t('teacher.exerciseBook') || 'Cahier Exercices',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      path: '/teacher/CahierExo',
    },
    {
      label: t('teacher.schedule') || 'Emploi du Temps',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: '/teacher/schedule',
    },
    {
      label: t('profile.title') || 'Profil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      path: '/teacher/profile',
    },
    {
      label: t('settings.title') || 'Paramètres',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: '/teacher/settings',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/teacher') {
      return location.pathname === '/teacher';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-blue-100 dark:border-gray-700 h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } hidden lg:flex lg:flex-col shadow-[2px_0_12px_rgba(30,64,175,0.08)] dark:shadow-[2px_0_12px_rgba(0,0,0,0.3)]`}
    >
      {/* Header avec logo et bouton hamburger */}
      <div className="relative h-16 flex items-center justify-between px-4 border-b border-blue-100 dark:border-gray-700 bg-linear-to-r from-blue-700 via-blue-800 to-blue-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-400 dark:bg-yellow-600 flex items-center justify-center text-blue-900 dark:text-blue-100 font-bold shadow-inner">
              EO
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-semibold text-sm uppercase tracking-widest">{t('teacher.role') || 'Enseignant'}</span>
              <span className="text-white/80 text-sm font-medium">Expression d'Or</span>
            </div>
          </div>
        )}
        <button
          title={t('sidebar.toggleMenu') || 'Ouvrir/Fermer le menu'}
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {!isCollapsed && (
          <div className="absolute inset-x-0 -bottom-px h-1 bg-linear-to-r from-yellow-300 via-yellow-400 to-yellow-500 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600" />
        )}
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all mb-2 border ${
              isActive(item.path)
                ? 'bg-linear-to-r from-yellow-400 via-yellow-300 to-yellow-400 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600 text-blue-900 dark:text-blue-100 shadow-lg border-yellow-300 dark:border-yellow-500'
                : 'text-blue-900 dark:text-blue-300 border-transparent hover:border-blue-100 dark:hover:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700'
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge && (
                  <span className="bg-yellow-400 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout button */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 shrink-0">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? (t('sidebar.logout') || 'Déconnexion') : undefined}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="font-medium">{t('sidebar.logout') || 'Déconnexion'}</span>}
        </button>
      </div>
    </div>
  );
};

