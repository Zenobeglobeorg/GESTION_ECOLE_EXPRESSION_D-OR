import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { useMessageCount } from '../../hooks/useMessageCount';

interface MobileSidebarParentProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebarParent = ({ isOpen, onClose }: MobileSidebarParentProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount: notificationCount } = useNotificationCount();
  const { unreadCount: messageCount } = useMessageCount();

  const menuItems = [
    { label: 'Tableau de Bord', path: '/parent', icon: '🏠', badge: undefined },
    { label: 'Notes & Bulletins', path: '/parent/grades', icon: '📊', badge: undefined },
    { label: 'Présences', path: '/parent/attendance', icon: '✓', badge: undefined },
    { label: 'Emploi du Temps', path: '/parent/schedule', icon: '📅', badge: undefined },
    { label: 'Frais de Scolarité', path: '/parent/fees', icon: '💰', badge: undefined },
    { label: 'Messages', path: '/parent/messages', icon: '💬', badge: messageCount > 0 ? messageCount : undefined },
    { label: 'Profil', path: '/parent/profile', icon: '👤', badge: undefined },
    { label: 'Paramètres', path: '/parent/settings', icon: '⚙️', badge: undefined },
    { label: 'Notifications', path: '/parent/notification', icon: '🔔', badge: notificationCount > 0 ? notificationCount : undefined },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  const isActive = (path: string) => {
    if (path === '/parent') {
      return location.pathname === '/parent';
    }
    return location.pathname.startsWith(path);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      {/* AJOUT: dark:bg-gray-800 */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 z-50 lg:hidden shadow-xl flex flex-col overflow-hidden hide-scrollbar transition-colors duration-300">
        
        {/* Header - Gradient Bleu + Bordure sombre */}
        {/* AJOUT: dark:border-gray-700 */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-white font-bold text-lg">Expression d'Or</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 hide-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              // AJOUT: Logique Dark Mode (text-gray-300, hover:bg-gray-700) + Thème Bleu
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all mb-1 ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-lg' // Actif (Bleu)
                  : 'text-gray-700 dark:text-gray-300 hover:bg-yellow-100 hover:text-yellow-900 dark:hover:bg-gray-700 dark:hover:text-white' // Inactif
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

        {/* Logout */}
        {/* AJOUT: dark:border-gray-700 */}
        <div className=" flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={handleLogout}
            // AJOUT: dark:hover:bg-red-900/20
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};