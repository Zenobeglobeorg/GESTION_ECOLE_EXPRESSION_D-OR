/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import * as messageService from '../services/messageService';

export interface MessageCountContextType {
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const MessageCountContext = createContext<MessageCountContextType | undefined>(undefined);

interface MessageCountProviderProps {
  children: ReactNode;
}

/**
 * Partage le nombre de messages non lus entre TOUTES les navbars/sidebars
 * (voir NotificationCountContext pour la même logique appliquée aux messages).
 */
export const MessageCountProvider = ({ children }: MessageCountProviderProps) => {
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

    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      loadUnreadCount();
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  return (
    <MessageCountContext.Provider value={{ unreadCount, loading, refresh: loadUnreadCount }}>
      {children}
    </MessageCountContext.Provider>
  );
};
