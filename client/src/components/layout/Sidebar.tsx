// Importation des hooks et composants nécessaires depuis React Router DOM et notre hook d'authentification personnalisé.
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Définition du type pour un élément du menu de la sidebar
interface MenuItem {
  label: string;           // Texte du menu
  icon: React.ReactNode;   // Icône SVG de l'élément
  path: string;            // Chemin de navigation
  badge?: number;          // (optionnel) Nombre pour afficher une pastille/badge
}

// Props attendues pour la Sidebar
interface SidebarProps {
  isCollapsed: boolean;    // Définit si la sidebar est repliée (true = affichée en petit)
  onToggle: () => void;    // Fonction appelée pour étendre/réduire la sidebar
}

// Composant principal Sidebar
export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  // Récupère la fonction de logout depuis le hook d'authentification
  const { logout } = useAuth();

  // Permet la navigation programmatique dans l'app
  const navigate = useNavigate();

  // Permet d'obtenir le chemin actuel de la page
  const location = useLocation();

  // Définition du tableau des éléments du menu principal de la sidebar.
  // Chacun correspond à une page principale de l'application.
  const menuItems: MenuItem[] = [
    {
      label: 'Tableau de Bord',
      // Icône pour le menu Tableau de Bord
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/superadmin',
    },
    {
      label: 'Inscription Élèves',
      // Icône pour Inscription Élèves
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      path: '/superadmin/students/new',
    },
    {
      label: 'Gestion Utilisateurs',
      // Icône pour Gestion Utilisateurs
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: '/superadmin/users',
    },
    {
      label: 'Rôles & Permissions',
      // Icône pour gestion des rôles et permissions
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      path: '/superadmin/roles',
    },
    {
      label: 'Vue Globale',
      // Icône pour la Vue Globale
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: '/superadmin/overview',
    },
    {
      label: 'Vue Administration',
      // Icône pour la Vue Administration
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      path: '/admin',
    },
    {
      label: 'Vue Enseignant',
      // Icône pour la Vue Enseignant
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      path: '/teacher',
    },
  ];

  // Fonction appelée lors du clic sur le bouton déconnexion (en bas de la sidebar)
  // Utilise le hook logout puis redirige vers la page de login
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Permet de savoir si le menu (par son chemin) doit être affiché comme actif (surbrillance)
  // /superadmin doit matcher exactement, les autres on vérifie si ça "débute par"
  const isActive = (path: string) => {
    if (path === '/superadmin') {
      return location.pathname === '/superadmin';
    }
    return location.pathname.startsWith(path);
  };

  // Rendu JSX de la Sidebar
  return (
    <div
      className={`bg-white border-r border-blue-100 h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } hidden lg:flex lg:flex-col shadow-[2px_0_12px_rgba(30,64,175,0.08)]`}
    >
      {/* Header avec logo et bouton hamburger */}
      <div className="relative h-16 flex items-center justify-between px-4 border-b border-blue-100 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold shadow-inner">
              EO
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-semibold text-sm uppercase tracking-widest">Super Admin</span>
              <span className="text-white/80 text-sm font-medium">Expression d'Or</span>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
          title="Ouvrir/Fermer le menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {!isCollapsed && (
          <div className="absolute inset-x-0 -bottom-px h-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500" />
        )}
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 bg-white">
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 border ${
                active
                  ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-blue-900 shadow-lg border-yellow-300'
                  : 'text-blue-900 border-transparent hover:border-blue-100 hover:bg-blue-50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
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

