import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { useMessageCount } from '../../hooks/useMessageCount';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { unreadCount: notificationCount } = useNotificationCount();
  const { unreadCount: messageCount } = useMessageCount();

  // Fonction pour obtenir le chemin du profil selon le rôle
  const getProfilePath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/superadmin/profile';
      case 'ADMINISTRATION':
        return '/admin/profile';
      case 'TEACHER':
        return '/teacher/profile';
      case 'PARENT':
        return '/parent/profile';
      default:
        return '/login';
    }
  };

  // Fonction pour obtenir le chemin des paramètres selon le rôle
  const getSettingsPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/superadmin/settings';
      case 'ADMINISTRATION':
        return '/admin/settings';
      case 'TEACHER':
        return '/teacher/settings';
      case 'PARENT':
        return '/parent/settings';
      default:
        return '/login';
    }
  };

  // Fonction pour obtenir le chemin de sécurité (2FA) selon le rôle
  const getSecurityPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/superadmin/settings#security';
      case 'ADMINISTRATION':
        return '/admin/settings#security';
      case 'TEACHER':
        return '/teacher/settings#security';
      case 'PARENT':
        return '/parent/settings#security';
      default:
        return '/login';
    }
  };

  // Fonction pour obtenir le chemin des notifications selon le rôle
  const getNotificationsPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/superadmin/notifications';
      case 'ADMINISTRATION':
        return '/admin/notifications';
      case 'TEACHER':
        return '/teacher/notifications';
      default:
        return '/login';
    }
  };

  // Fonction pour obtenir le chemin des messages selon le rôle
  const getMessagesPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
      case 'ADMINISTRATION':
        return '/admin/messages';
      default:
        return '/login';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationMenuOpen(false);
      }
    };

    if (isProfileMenuOpen || isNotificationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen, isNotificationMenuOpen]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 h-16 fixed top-0 right-0 left-0 z-30 transition-colors duration-300">
      <div className="h-full flex items-center justify-between px-4">
        {/* Bouton Menu Hamburger (mobile/desktop) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Espace vide pour centrer le contenu */}
        <div className="flex-1"></div>

        {/* Cloche de notification (pour teacher, admin, super admin) */}
        {(user?.role === 'TEACHER' || user?.role === 'ADMINISTRATION' || user?.role === 'SUPER_ADMIN') && (
          <div className="relative mr-3" ref={notificationRef}>
            <button
              onClick={() => {
                setIsNotificationMenuOpen(!isNotificationMenuOpen);
                setIsProfileMenuOpen(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
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

            {/* Menu déroulant notifications */}
            {isNotificationMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                  {notificationCount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {notificationCount} notification{notificationCount > 1 ? 's' : ''} non lue{notificationCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate(getNotificationsPath());
                      setIsNotificationMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Icône de messages (pour admin et super admin) */}
        {(user?.role === 'ADMINISTRATION' || user?.role === 'SUPER_ADMIN') && (
          <button
            onClick={() => navigate(getMessagesPath())}
            className="relative mr-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
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
        )}

        {/* Profil utilisateur avec menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>

            {/* Nom et rôle */}
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role === 'SUPER_ADMIN' ? 'Super-Administrateur' : user?.role}
              </p>
            </div>

            {/* Flèche */}
            <svg
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                isProfileMenuOpen ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Menu déroulant */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 transition-colors duration-300">
              {/* En-tête */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
              </div>

              {/* Options du menu */}
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate(getProfilePath());
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mon Profil
                </button>

                <button
                  onClick={() => {
                    navigate(getSettingsPath());
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Paramètres
                </button>

                <button
                  onClick={() => {
                    const securityPath = getSecurityPath();
                    if (securityPath.includes('#')) {
                      const [path] = securityPath.split('#');
                      navigate(path);
                      setTimeout(() => {
                        const element = document.getElementById('security');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    } else {
                      navigate(securityPath);
                    }
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sécurité
                </button>

                <hr className="my-2 border-gray-200 dark:border-gray-700" />

                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Aide & Support
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
