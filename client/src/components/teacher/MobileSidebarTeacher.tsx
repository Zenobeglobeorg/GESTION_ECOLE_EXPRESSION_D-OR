import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotificationCount } from '../../hooks/useNotificationCount';

interface MobileSidebarTeacherProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebarTeacher = ({ isOpen, onClose }: MobileSidebarTeacherProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { unreadCount: notificationCount } = useNotificationCount();

  const baseMenuItems = [
    { label: t('teacher.dashboard') || 'Tableau de Bord', path: '/teacher', icon: '🏠', badge: undefined },
    { label: t('teacher.myClasses') || 'Mes Classes', path: '/teacher/classes', icon: '📚', badge: undefined },
    { label: t('grades.fillGrades') || 'Remplir Notes', path: '/teacher/RemplitNote', icon: '📝', badge: undefined },
    { label: t('teacher.gradeBook') || 'Carnet de Notes', path: '/teacher/CarnetNote', icon: '📖', badge: undefined },
    { label: t('teacher.attendance') || 'Présences', path: '/teacher/Presence', icon: '✓', badge: undefined },
    { label: t('teacher.attendanceSheet') || 'Fiche Présence', path: '/teacher/FichePresence', icon: '📋', badge: undefined },
    { label: t('teacher.exerciseBook') || 'Cahier Exercices', path: '/teacher/CahierExo', icon: '📘', badge: undefined },
    { label: t('teacher.schedule') || 'Emploi du Temps', path: '/teacher/schedule', icon: '📅', badge: undefined },
    { label: t('teacher.notifications') || 'Notification', path: '/teacher/notifications', icon: '📨', badge: notificationCount > 0 ? notificationCount : undefined },
    { label: t('profile.title') || 'Profil', path: '/teacher/profile', icon: '👤', badge: undefined },
    { label: t('settings.title') || 'Paramètres', path: '/teacher/settings', icon: '⚙️', badge: undefined },
  ];

  // Ajouter le menu Dashboard Super Admin si l'utilisateur est SUPER_ADMIN
  const menuItems = user?.role === 'SUPER_ADMIN'
    ? [
        { label: 'Dashboard Super Admin', path: '/superadmin', icon: '🛡️', badge: undefined },
        ...baseMenuItems,
      ]
    : baseMenuItems;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    onClose();
  };

  const isActive = (path: string) => {
    if (path === '/teacher' || path === '/superadmin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 z-50 lg:hidden shadow-xl flex flex-col">
        {/* Header - Fixed */}
        <div className="relative h-16 flex items-center justify-between px-4 border-b border-blue-100 dark:border-gray-700 bg-linear-to-r from-blue-700 via-blue-800 to-blue-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-400 dark:bg-yellow-600 flex items-center justify-center text-blue-900 dark:text-blue-100 font-bold shadow-inner">
              EO
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-semibold text-sm uppercase tracking-widest">{t('teacher.role') || 'Enseignant'}</span>
              <span className="text-white/80 text-sm font-medium">Expression d'Or</span>
            </div>
          </div>
          <button
            title="Fermer la sidebar"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute inset-x-0 -bottom-px h-1 bg-linear-to-r from-yellow-300 via-yellow-400 to-yellow-500 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600" />
        </div>

        {/* Menu items - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 min-h-0">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all mb-2 border ${
                isActive(item.path)
                  ? 'bg-linear-to-r from-yellow-400 via-yellow-300 to-yellow-400 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600 text-blue-900 dark:text-blue-100 shadow-lg border-yellow-300 dark:border-yellow-500'
                  : 'text-blue-900 dark:text-blue-300 border-transparent hover:border-blue-100 dark:hover:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </span>
              <span className="font-medium flex-1">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout button - Fixed */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">{t('sidebar.logout') || 'Déconnexion'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

