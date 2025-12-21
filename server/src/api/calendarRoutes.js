import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as calendarController from '../controllers/calendarController.js';

const router = express.Router();
router.use(authenticateToken);

// Récupérer tous les événements
router.get(
  '/',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER', 'PARENT'),
  calendarController.getEvents
);

// Récupérer un événement par ID
router.get(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER', 'PARENT'),
  calendarController.getEventById
);

// Créer un événement
router.post(
  '/',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  calendarController.createEvent
);

// Mettre à jour un événement
router.put(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  calendarController.updateEvent
);

// Supprimer un événement
router.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  calendarController.deleteEvent
);

export default router;


