import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Statistiques pour Admin
router.get('/admin', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), dashboardController.getAdminStats);

// Statistiques pour Super Admin
router.get('/superadmin', requireRole('SUPER_ADMIN'), dashboardController.getSuperAdminStats);

// Statistiques pour Teacher
router.get('/teacher', requireRole('TEACHER', 'SUPER_ADMIN'), dashboardController.getTeacherStats);

export default router;

