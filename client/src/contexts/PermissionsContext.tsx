/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export interface Permission {
  id: number;
  key: string;
  name: string;
  description?: string;
  category: string;
}

interface UserPermissionsResponse {
  permissions: Permission[];
  isSuperAdmin: boolean;
}

export interface PermissionsContextType {
  permissions: Permission[];
  isSuperAdmin: boolean;
  loading: boolean;
  hasPermission: (permissionKey: string) => boolean;
  hasAnyPermission: (permissionKeys: string[]) => boolean;
  hasAllPermissions: (permissionKeys: string[]) => boolean;
}

export const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

/**
 * Charge les permissions de l'utilisateur connecté UNE SEULE FOIS par session
 * (au lieu de refaire un fetch à chaque page qui utilise usePermissions/ProtectedContent),
 * et les partage à toute l'application.
 */
export const PermissionsProvider = ({ children }: PermissionsProviderProps) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user) {
        setPermissions([]);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Super-Admin a toutes les permissions
      if (user.role === 'SUPER_ADMIN') {
        try {
          const allPermissions = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/permissions`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }).then(res => res.json());
          setPermissions(allPermissions);
          setIsSuperAdmin(true);
        } catch (err) {
          console.error('Error loading permissions:', err);
          setPermissions([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Pour les autres utilisateurs, charger leurs permissions
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/${user.id}/permissions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: UserPermissionsResponse = await response.json();
          setPermissions(data.permissions || []);
          setIsSuperAdmin(data.isSuperAdmin || false);
        } else {
          setPermissions([]);
          setIsSuperAdmin(false);
        }
      } catch (err) {
        console.error('Error loading user permissions:', err);
        setPermissions([]);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user]);

  const hasPermission = (permissionKey: string): boolean => {
    if (isSuperAdmin) return true;
    return permissions.some(p => p.key === permissionKey);
  };

  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionKeys.some(key => hasPermission(key));
  };

  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionKeys.every(key => hasPermission(key));
  };

  const value: PermissionsContextType = {
    permissions,
    isSuperAdmin,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};
