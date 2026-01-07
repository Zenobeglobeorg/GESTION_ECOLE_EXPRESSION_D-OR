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
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

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



