import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Récupérer toutes les notifications de l'utilisateur
router.get('/', notificationController.getUserNotifications);

// Récupérer le nombre de notifications non lues
router.get('/unread-count', notificationController.getUnreadNotificationCount);

// Marquer une notification comme lue
router.patch('/:notificationId/read', notificationController.markNotificationAsRead);

// Marquer toutes les notifications comme lues
router.patch('/read-all', notificationController.markAllNotificationsAsRead);

// Supprimer une notification
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;

