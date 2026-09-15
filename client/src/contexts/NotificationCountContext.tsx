/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import * as notificationService from '../services/notificationService';

export interface NotificationCountContextType {
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const NotificationCountContext = createContext<NotificationCountContextType | undefined>(undefined);

interface NotificationCountProviderProps {
  children: ReactNode;
}

/**
 * Partage le nombre de notifications non lues entre TOUTES les navbars/sidebars
 * (au lieu d'une instance indépendante par composant) : quand une notification est
 * marquée comme lue quelque part, on appelle refresh() ici et le badge se met à jour
 * partout immédiatement, au lieu d'attendre jusqu'à 30s le prochain sondage.
 */
export const NotificationCountProvider = ({ children }: NotificationCountProviderProps) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Erreur lors du chargement du nombre de notifications:', err);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Recharger périodiquement (filet de sécurité, en plus du refresh() explicite et du WebSocket)
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      loadUnreadCount();
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  return (
    <NotificationCountContext.Provider value={{ unreadCount, loading, refresh: loadUnreadCount }}>
      {children}
    </NotificationCountContext.Provider>
  );
};
