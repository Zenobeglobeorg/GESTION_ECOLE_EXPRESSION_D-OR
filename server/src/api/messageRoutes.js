import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as messageController from '../controllers/messageController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Récupérer toutes les conversations
router.get('/conversations', 
  requireRole('PARENT', 'ADMINISTRATION', 'SUPER_ADMIN'),
  messageController.getConversations
);

// Récupérer les messages d'une conversation
router.get('/conversations/:otherUserId/messages',
  requireRole('PARENT', 'ADMINISTRATION', 'SUPER_ADMIN'),
  messageController.getMessages
);

// Envoyer un message
router.post('/send',
  requireRole('PARENT', 'ADMINISTRATION', 'SUPER_ADMIN'),
  messageController.sendMessage
);

// Marquer un message comme lu
router.patch('/:messageId/read',
  requireRole('PARENT', 'ADMINISTRATION', 'SUPER_ADMIN'),
  messageController.markAsRead
);

// Récupérer le nombre de messages non lus
router.get('/unread-count',
  requireRole('PARENT', 'ADMINISTRATION', 'SUPER_ADMIN'),
  messageController.getUnreadCount
);

export default router;


