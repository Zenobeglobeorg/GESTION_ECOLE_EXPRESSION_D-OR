import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Toutes les routes utilisateurs requièrent une authentification
router.use(authenticateToken);

// Routes pour le profil de l'utilisateur connecté (tous les rôles)
router.get('/me', userController.getCurrentUser);
router.put('/me/profile', userController.updateProfile);
router.put('/me/password', userController.changePassword);
router.put('/me/preferences', userController.updatePreferences);

// Seuls SUPER_ADMIN et ADMINISTRATION peuvent gérer les utilisateurs
router.get('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), userController.listUsers);
router.post('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), userController.createUser);
router.get('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), userController.getUserById);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), userController.updateUser);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), userController.deleteUser);

export default router;


