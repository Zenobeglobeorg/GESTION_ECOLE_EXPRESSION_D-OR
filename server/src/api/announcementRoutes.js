import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as announcementController from '../controllers/announcementController.js';

const router = express.Router();
router.use(authenticateToken);

// Récupérer toutes les annonces
router.get(
  '/',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER', 'PARENT'),
  announcementController.getAnnouncements
);

// Récupérer une annonce par ID
router.get(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER', 'PARENT'),
  announcementController.getAnnouncementById
);

// Créer une annonce
router.post(
  '/',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  announcementController.createAnnouncement
);

// Mettre à jour une annonce
router.put(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  announcementController.updateAnnouncement
);

// Supprimer une annonce
router.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  announcementController.deleteAnnouncement
);

// Relancer une annonce
router.post(
  '/:id/resend',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  announcementController.resendAnnouncement
);

export default router;

