import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as attendanceController from '../controllers/attendanceController.js';

const router = express.Router();
router.use(authenticateToken);

// Récupérer toutes les présences (avec filtres optionnels)
router.get(
  '/',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'),
  attendanceController.getAttendances
);

// Récupérer les statistiques de présence
router.get(
  '/stats',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'),
  attendanceController.getAttendanceStats
);

// Récupérer les alertes d'absentéisme
router.get(
  '/alerts',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  attendanceController.getAbsenteeismAlerts
);

// Routes pour les parents : récupérer les présences de leurs enfants
router.get(
  '/my-children',
  requireRole('PARENT'),
  attendanceController.getMyChildrenAttendances
);

router.get(
  '/my-children/stats',
  requireRole('PARENT'),
  attendanceController.getMyChildrenAttendanceStats
);

// Enregistrer les présences pour une classe
router.post(
  '/mark',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'),
  attendanceController.markAttendances
);

// Récupérer une présence par ID
router.get(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'),
  attendanceController.getAttendanceById
);

// Mettre à jour une présence
router.put(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'),
  attendanceController.updateAttendance
);

// Supprimer une présence
router.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  attendanceController.deleteAttendance
);

export default router;


