import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Composant qui protège une route en vérifiant les permissions
 */
export const ProtectedRoute = ({
  permission,
  permissions,
  requireAll = false,
  children,
  redirectTo = '/admin',
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si les permissions sont en cours de chargement, afficher un loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Super-Admin a toujours accès
  if (user.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // Vérifier les permissions
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    // Si aucune permission n'est spécifiée, on autorise l'accès
    hasAccess = true;
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <button
            onClick={() => window.location.href = redirectTo}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};


