import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import * as notificationService from '../services/notificationService';

/**
 * Hook pour récupérer et mettre à jour le nombre de notifications non lues
 */
export const useNotificationCount = () => {
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = async () => {
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
    
    // Recharger périodiquement
    const interval = setInterval(loadUnreadCount, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, []);

  // Écouter les nouvelles notifications via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      // Recharger le compteur quand une nouvelle notification arrive
      loadUnreadCount();
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  return { unreadCount, loading, refresh: loadUnreadCount };
};



