import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

// Variable globale pour stocker l'instance Socket.IO
let ioInstance = null;

/**
 * Définit l'instance Socket.IO pour l'utiliser dans les notifications
 */
export const setSocketIO = (io) => {
  ioInstance = io;
};

/**
 * Crée une notification pour un utilisateur
 */
export const createNotification = async (userId, type, title, content, relatedId = null, metadata = null) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      content,
      relatedId,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    },
  });

  // Envoyer la notification via WebSocket si l'utilisateur est connecté
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('new_notification', notification);
  }

  return notification;
};

/**
 * Crée des notifications pour plusieurs utilisateurs
 */
export const createNotificationsForUsers = async (userIds, type, title, content, relatedId = null, metadata = null) => {
  const notifications = userIds.map(userId => ({
    userId,
    type,
    title,
    content,
    relatedId,
    metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
  }));

  const result = await prisma.notification.createMany({
    data: notifications,
  });

  // Envoyer les notifications via WebSocket aux utilisateurs connectés
  if (ioInstance && result.count > 0) {
    // Récupérer les notifications créées pour les envoyer
    const createdNotifications = await prisma.notification.findMany({
      where: {
        userId: { in: userIds },
        type,
        title,
        createdAt: {
          gte: new Date(Date.now() - 1000), // Notifications créées dans la dernière seconde
        },
      },
      orderBy: { createdAt: 'desc' },
      take: result.count,
    });

    // Envoyer chaque notification à son utilisateur
    createdNotifications.forEach(notification => {
      ioInstance.to(`user:${notification.userId}`).emit('new_notification', notification);
    });
  }

  return result;
};

/**
 * Récupère toutes les notifications pour un utilisateur
 */
export const getUserNotifications = async (req, res) => {
  try {
    const user = req.user;
    const { unreadOnly } = req.query;

    const where = {
      userId: user.id,
      ...(unreadOnly === 'true' && { isRead: false }),
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(notifications);
  } catch (err) {
    console.error('getUserNotifications error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
};

/**
 * Marque une notification comme lue
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const user = req.user;
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(notificationId) },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    if (notification.userId !== user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(notificationId) },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('markNotificationAsRead error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification' });
  }
};

/**
 * Marque toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const user = req.user;

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('markAllNotificationsAsRead error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des notifications' });
  }
};

/**
 * Récupère le nombre de notifications non lues
 */
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const user = req.user;

    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (err) {
    console.error('getUnreadNotificationCount error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du nombre de notifications' });
  }
};

/**
 * Supprime une notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const user = req.user;
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(notificationId) },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    if (notification.userId !== user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await prisma.notification.delete({
      where: { id: parseInt(notificationId) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('deleteNotification error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la notification' });
  }
};

