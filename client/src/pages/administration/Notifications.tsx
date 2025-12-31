import React, { useState, useMemo, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import * as notificationService from '../../services/notificationService';
import { useSocket } from '../../hooks/useSocket';

// Icônes pour chaque type
const notificationIcons: { [key: string]: string } = {
  CALENDAR_EVENT: '📅',
  ASSIGNMENT: '📝',
  ANNOUNCEMENT: '🔔',
  GRADE: '📊',
  ATTENDANCE: '✓',
  PAYMENT: '💰',
  BULLETIN: '📄',
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `il y a ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const Notifications = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<notificationService.Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les notifications au montage
  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  // Écouter les nouvelles notifications via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: notificationService.Notification) => {
      setNotifications(prev => {
        if (prev.some(n => n.id === notification.id)) {
          return prev;
        }
        return [notification, ...prev];
      });
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(activeTab === 'unread');
      setNotifications(data);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  return (
    <AdminLayout
      title="Centre de Notifications"
      subtitle="Consultez toutes vos notifications importantes."
    >
      <ProtectedContent permission="users.read" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission d'accéder aux notifications.
        </div>
      }>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">
              Centre de Notifications
            </h2>
            <button 
              onClick={handleMarkAllAsRead}
              className="mt-2 sm:mt-0 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              Tout marquer comme lu
            </button>
          </div>
          
          <div className="flex space-x-1">
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-yellow-900 hover:bg-yellow-100 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('all')}
            >
              Toutes
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'unread'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-yellow-900 hover:bg-yellow-100 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('unread')}
            >
              Non lues
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Chargement...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                className="flex items-start gap-4 p-6 transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/30 cursor-pointer"
              >
                <span className="text-2xl mt-1">{notificationIcons[notification.type] || '🔔'}</span>
                
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notification.content}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                </div>

                {!notification.isRead && (
                  <span className="flex-shrink-0 w-3 h-3 mt-1.5 bg-blue-500 rounded-full" title="Non lu"></span>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <span className="text-5xl">🎉</span>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">Tout est à jour !</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {activeTab === 'unread' 
                  ? 'Vous avez lu toutes vos notifications.' 
                  : 'Vous n\'avez pas encore de notification.'}
              </p>
            </div>
          )}
        </div>
      </div>
      </ProtectedContent>
    </AdminLayout>
  );
};
