import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import { getAdminThemeClasses } from '../../utils/adminTheme';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { useLanguage } from '../../contexts/LanguageContext';

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuGroup {
  label: string;
  icon: React.ReactNode;
  submenu: SubMenuItem[];
}

interface SingleMenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

type MenuItem = MenuGroup | SingleMenuItem;

interface SidebarAdminProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const isMenuGroup = (item: MenuItem): item is MenuGroup => {
  return 'submenu' in item;
};

const MENU_ITEMS: MenuItem[] = [
    {
      label: 'Tableau de Bord',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/admin',
    },
    {
      label: 'Utilisateurs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 8H9m6 0a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      submenu: [
        { label: 'Gestion Utilisateurs', path: '/admin/users' },
        { label: 'Parents', path: '/admin/users/parents' },
        { label: 'Enseignants', path: '/admin/users/teachers' },
        { label: 'Administrateurs', path: '/admin/users/admins' },
        { label: 'Permissions', path: '/admin/users/permissions' },
      ],
    },
    {
      label: 'Élèves',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      submenu: [
        { label: 'Dossiers Élèves', path: '/admin/students' },
        { label: 'Inscription', path: '/admin/students/new' },
        { label: 'Association Parents', path: '/admin/students/associate' },
        { label: 'Import Excel', path: '/admin/students/import' },
      ],
    },
    {
      label: 'Pédagogie',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      submenu: [
        { label: 'Classes & Matières', path: '/admin/classes' },
        { label: 'Emploi du Temps', path: '/admin/timetable' },
        { label: 'Évaluations', path: '/admin/evaluations' },
      { label: 'Notes & Bulletins', path: '/admin/grades' },
      { label: 'Générer Bulletins', path: '/admin/bulletins' },
      { label: 'Remplacements', path: '/admin/replacements' },
      ],
    },
    {
      label: 'Vie Scolaire',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 5a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      submenu: [
        { label: 'Présence', path: '/admin/attendance' },
        { label: 'Frais de Scolarité', path: '/admin/fees' },
        { label: 'Rapports', path: '/admin/reports' },
      ],
    },
    {
      label: 'Communication',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.961 1.961 0 01-2.437-1.865V5.882m0 0A6.97 6.97 0 006 3a6 6 0 00-6 6v7a6 6 0 006 6 6.975 6.975 0 003.563-.938m13.437-13.868A6.97 6.97 0 0018 3a6 6 0 00-6 6v7a6 6 0 006 6 6.975 6.975 0 003.563-.938" />
        </svg>
      ),
      submenu: [
        { label: 'Annonces', path: '/admin/announcements' },
        { label: 'Notifications', path: '/admin/notifications' },
        { label: 'Messages', path: '/admin/messages' },
        { label: 'Calendrier', path: '/admin/calendar' },
      ],
    },
    {
      label: 'Profil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/admin/profile',
    },
    {
      label: 'Paramètres',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: '/admin/settings',
    },
];

const defaultExpandedGroups = MENU_ITEMS.reduce<Record<string, boolean>>((accumulator, item) => {
  if (!isMenuGroup(item)) return accumulator;
  accumulator[item.label] = item.label === 'Utilisateurs' || item.label === 'Élèves';
  return accumulator;
}, {});

export const SidebarAdmin = ({ isCollapsed, onToggle }: SidebarAdminProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColor } = useAdminTheme();
  const themeClasses = getAdminThemeClasses(themeColor);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(defaultExpandedGroups);
  const { unreadCount: notificationCount } = useNotificationCount();
  const { t } = useLanguage();
  // Ajouter le menu Dashboard Super Admin si l'utilisateur est SUPER_ADMIN
  const menuItems: MenuItem[] = user?.role === 'SUPER_ADMIN' 
    ? [
        {
            label: t('sidebar.superAdminView'),
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          path: '/superadmin',
        },
        ...MENU_ITEMS,
      ]
    : MENU_ITEMS;

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => ({
      ...Object.keys(prev).reduce<Record<string, boolean>>((accumulator, key) => {
        accumulator[key] = false;
        return accumulator;
      }, {}),
      [groupLabel]: !prev[groupLabel],
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/superadmin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isGroupActive = (submenu: SubMenuItem[]): boolean => submenu.some((item) => isActive(item.path));

  const activeGroupLabel = useMemo(() => {
    const activeMenuGroup = MENU_ITEMS.find(
      (item) => isMenuGroup(item) && item.submenu.some((subItem) => isActive(subItem.path)),
    ) as MenuGroup | undefined;
    return activeMenuGroup?.label;
  }, [location.pathname]);

  useEffect(() => {
    if (!activeGroupLabel) return;
    setExpandedGroups((prev) => ({
      ...Object.keys(prev).reduce<Record<string, boolean>>((accumulator, key) => {
        accumulator[key] = false;
        return accumulator;
      }, {}),
      [activeGroupLabel]: true,
    }));
  }, [activeGroupLabel]);

  // Classes dynamiques selon le thème
  const getHeaderBg = () => {
    const themes: Record<string, string> = {
      'blue-yellow': 'bg-linear-to-r from-blue-700 via-blue-800 to-blue-900',
      'green-teal': 'bg-linear-to-r from-green-700 via-green-800 to-green-900',
      'purple-pink': 'bg-linear-to-r from-purple-700 via-purple-800 to-purple-900',
      'orange-red': 'bg-linear-to-r from-orange-700 via-orange-800 to-orange-900',
      'indigo-blue': 'bg-linear-to-r from-indigo-700 via-indigo-800 to-indigo-900',
    };
    return themes[themeColor] || themes['blue-yellow'];
  };

  const getActiveItemClasses = () => {
    const themes: Record<string, string> = {
      'blue-yellow': 'bg-linear-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-blue-900 shadow-lg border-yellow-300',
      'green-teal': 'bg-linear-to-r from-teal-400 via-teal-300 to-teal-400 text-green-900 shadow-lg border-teal-300',
      'purple-pink': 'bg-linear-to-r from-pink-400 via-pink-300 to-pink-400 text-purple-900 shadow-lg border-pink-300',
      'orange-red': 'bg-linear-to-r from-red-400 via-red-300 to-red-400 text-orange-900 shadow-lg border-red-300',
      'indigo-blue': 'bg-linear-to-r from-blue-400 via-blue-300 to-blue-400 text-indigo-900 shadow-lg border-blue-300',
    };
    return themes[themeColor] || themes['blue-yellow'];
  };

  const getGroupActiveClasses = () => {
    const themes: Record<string, string> = {
      'blue-yellow': 'bg-linear-to-r from-yellow-300 via-yellow-200 to-yellow-300 text-blue-900 border-yellow-300',
      'green-teal': 'bg-linear-to-r from-teal-300 via-teal-200 to-teal-300 text-green-900 border-teal-300',
      'purple-pink': 'bg-linear-to-r from-pink-300 via-pink-200 to-pink-300 text-purple-900 border-pink-300',
      'orange-red': 'bg-linear-to-r from-red-300 via-red-200 to-red-300 text-orange-900 border-red-300',
      'indigo-blue': 'bg-linear-to-r from-blue-300 via-blue-200 to-blue-300 text-indigo-900 border-blue-300',
    };
    return themes[themeColor] || themes['blue-yellow'];
  };

  const getSubmenuActiveClasses = () => {
    const themes: Record<string, string> = {
      'blue-yellow': 'bg-yellow-100 text-blue-900 font-semibold border border-yellow-300',
      'green-teal': 'bg-teal-100 text-green-900 font-semibold border border-teal-300',
      'purple-pink': 'bg-pink-100 text-purple-900 font-semibold border border-pink-300',
      'orange-red': 'bg-red-100 text-orange-900 font-semibold border border-red-300',
      'indigo-blue': 'bg-blue-100 text-indigo-900 font-semibold border border-blue-300',
    };
    return themes[themeColor] || themes['blue-yellow'];
  };

  const getBorderColor = () => {
    const themes: Record<string, string> = {
      'blue-yellow': 'border-blue-100',
      'green-teal': 'border-green-100',
      'purple-pink': 'border-purple-100',
      'orange-red': 'border-orange-100',
      'indigo-blue': 'border-indigo-100',
    };
    return themes[themeColor] || themes['blue-yellow'];
  };

  const getHoverClasses = () => {
    const themes: Record<string, string> = {
      'blue-yellow': 'hover:border-blue-100 hover:bg-blue-50 text-blue-900',
      'green-teal': 'hover:border-green-100 hover:bg-green-50 text-green-900',
      'purple-pink': 'hover:border-purple-100 hover:bg-purple-50 text-purple-900',
      'orange-red': 'hover:border-orange-100 hover:bg-orange-50 text-orange-900',
      'indigo-blue': 'hover:border-indigo-100 hover:bg-indigo-50 text-indigo-900',
    };
    return themes[themeColor] || themes['blue-yellow'];
  };

  const getSubmenuBg = () => {
    const themes: Record<string, string> = {
      'blue-yellow': 'bg-blue-50/70 border-blue-200',
      'green-teal': 'bg-green-50/70 border-green-200',
      'purple-pink': 'bg-purple-50/70 border-purple-200',
      'orange-red': 'bg-orange-50/70 border-orange-200',
      'indigo-blue': 'bg-indigo-50/70 border-indigo-200',
    };
    return themes[themeColor] || themes['blue-yellow'];
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r ${getBorderColor()} dark:border-gray-700 h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } hidden lg:flex lg:flex-col shadow-[2px_0_12px_rgba(30,64,175,0.08)]`}
    >
      {/* Header avec logo et bouton hamburger */}
      <div className={`relative h-16 flex items-center justify-between px-4 border-b ${getBorderColor()} ${getHeaderBg()} flex-shrink-0`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold shadow-inner">
              EO
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-semibold text-sm uppercase tracking-widest">Administration</span>
              <span className="text-white/80 text-sm font-medium">Expression d'Or</span>
            </div>
          </div>
        )}
        <button
          title="Ouvrir/Fermer le menu"
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {!isCollapsed && (
          <div className="absolute inset-x-0 -bottom-px h-1 bg-linear-to-r from-yellow-300 via-yellow-400 to-yellow-500" />
        )}
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 bg-white dark:bg-gray-800">
        {menuItems.map((item) => {
          if (isMenuGroup(item)) {
            const isExpanded = expandedGroups[item.label];
            const groupIsActive = isGroupActive(item.submenu);
            return (
              <div key={item.label} className="mb-2">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                    groupIsActive
                      ? `${getGroupActiveClasses()} shadow-sm`
                      : `${getHoverClasses()} border-transparent`
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="shrink-0 relative">
                    {item.icon}
                    {!isCollapsed && item.label === 'Communication' && notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 font-medium text-left">{item.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0l-7 7m7-7v12" />
                      </svg>
                    </>
                  )}
                </button>

                {isExpanded && !isCollapsed && (
                  <div className={`${getSubmenuBg()} rounded-lg mt-2 ml-3 border-l-4`}>
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.path}
                        to={subitem.path}
                        className={`block px-4 py-2 text-sm rounded-lg transition-all ml-3 mr-3 my-1 ${
                          isActive(subitem.path)
                            ? `${getSubmenuActiveClasses()} shadow-sm`
                            : `${themeClasses.textPrimaryLight} hover:${themeClasses.textPrimary} hover:bg-blue-50 dark:hover:bg-gray-700`
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          {subitem.label}
                          {subitem.path === '/admin/notifications' && notificationCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2">
                              {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 border ${
                isActive(item.path)
                  ? `${getActiveItemClasses()}`
                  : `${getHoverClasses()} border-transparent`
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="flex-1 font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="border-t border-gray-200 p-4 shrink-0">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Déconnexion' : undefined}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="font-medium">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

