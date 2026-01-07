import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import * as userService from '../services/userService';

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

/**
 * Hook pour gérer les permissions de l'utilisateur connecté
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

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
        }
      } catch (err) {
        console.error('Error loading user permissions:', err);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user]);

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = (permissionKey: string): boolean => {
    if (isSuperAdmin) return true;
    return permissions.some(p => p.key === permissionKey);
  };

  /**
   * Vérifie si l'utilisateur a au moins une des permissions spécifiées
   */
  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionKeys.some(key => hasPermission(key));
  };

  /**
   * Vérifie si l'utilisateur a toutes les permissions spécifiées
   */
  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionKeys.every(key => hasPermission(key));
  };

  return {
    permissions,
    isSuperAdmin,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};



