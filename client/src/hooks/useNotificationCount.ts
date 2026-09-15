import { useContext } from 'react';
import { NotificationCountContext } from '../contexts/NotificationCountContext';

/**
 * Hook pour accéder au nombre de notifications non lues, partagé entre toute
 * l'application (voir NotificationCountProvider dans App.tsx).
 */
export const useNotificationCount = () => {
  const context = useContext(NotificationCountContext);
  if (context === undefined) {
    throw new Error('useNotificationCount must be used within a NotificationCountProvider');
  }
  return context;
};
