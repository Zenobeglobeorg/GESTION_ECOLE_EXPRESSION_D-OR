import { useContext } from 'react';
import { PermissionsContext } from '../contexts/PermissionsContext';

export type { Permission } from '../contexts/PermissionsContext';

/**
 * Hook pour accéder aux permissions de l'utilisateur connecté.
 * Les permissions sont chargées une seule fois par session par PermissionsProvider
 * (voir App.tsx) et partagées entre toutes les pages qui appellent ce hook.
 */
export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
