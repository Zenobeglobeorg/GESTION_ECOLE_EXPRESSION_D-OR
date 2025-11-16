import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface MobileSidebarAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebarAdmin = ({ isOpen, onClose }: MobileSidebarAdminProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Tableau de Bord', path: '/admin', icon: '🏠' },
    { label: 'Inscription Élèves', path: '/admin/students/new', icon: '➕' },
    { label: 'Liste des Élèves', path: '/admin/students', icon: '👥' },
    { label: 'Classes', path: '/admin/classes', icon: '📚' },
    { label: 'Notes & Évaluations', path: '/admin/grades', icon: '📝' },
    { label: 'Présences', path: '/admin/attendance', icon: '✓' },
    { label: 'Bulletins', path: '/admin/reports', icon: '📊' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
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
      <div className="fixed left-0 top-0 h-full w-64 bg-white z-50 lg:hidden shadow-xl">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
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

        <nav className="flex-1 overflow-y-auto py-4 bg-white">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all mb-2 border ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-blue-900 shadow-lg border-yellow-300'
                  : 'text-blue-900 border-transparent hover:border-blue-100 hover:bg-blue-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 hover:bg-red-50"
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

