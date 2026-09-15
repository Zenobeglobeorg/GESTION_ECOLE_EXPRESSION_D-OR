import { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedContentProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // Si true, nécessite toutes les permissions, sinon au moins une
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Composant qui affiche son contenu uniquement si l'utilisateur a les permissions requises
 */
export const ProtectedContent = ({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: ProtectedContentProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // Tant que les permissions ne sont pas encore chargées, ne rien décider :
  // sinon hasAccess vaut faussement "false" (permissions vides par défaut) et on
  // affiche le message "accès refusé" pendant un instant, même pour un utilisateur autorisé.
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    // Si aucune permission n'est spécifiée, on autorise l'accès
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};




