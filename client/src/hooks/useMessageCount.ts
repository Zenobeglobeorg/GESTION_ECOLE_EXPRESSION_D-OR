import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import * as messageService from '../services/messageService';

/**
 * Hook pour récupérer et mettre à jour le nombre de messages non lus
 */
export const useMessageCount = () => {
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = async () => {
    try {
      const data = await messageService.getUnreadCount();
      setUnreadCount(data.unread || 0);
    } catch (err) {
      console.error('Erreur lors du chargement du nombre de messages:', err);
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

  // Écouter les nouveaux messages via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      // Recharger le compteur quand un nouveau message arrive
      loadUnreadCount();
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  return { unreadCount, loading, refresh: loadUnreadCount };
};



