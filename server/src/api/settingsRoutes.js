import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as settingsController from '../controllers/settingsController.js';
import * as twoFactorController from '../controllers/twoFactorController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les paramètres de l'école (seulement pour SUPER_ADMIN et ADMINISTRATION)
router.get(
  '/school',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  settingsController.getSchoolSettings
);
router.put(
  '/school',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  settingsController.updateSchoolSettings
);

// Routes pour les paramètres système
router.get(
  '/system',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  settingsController.getSystemSettings
);
router.put(
  '/system',
  requireRole('SUPER_ADMIN', 'ADMINISTRATION'),
  settingsController.updateSystemSettings
);

// Routes pour la double authentification (2FA) - accessible à tous les utilisateurs authentifiés
router.get('/two-factor/status', twoFactorController.getTwoFactorStatus);
router.post('/two-factor/enable', twoFactorController.enableTwoFactor);
router.post('/two-factor/verify', twoFactorController.verifyAndEnableTwoFactor);
router.post('/two-factor/disable', twoFactorController.disableTwoFactor);

export default router;

