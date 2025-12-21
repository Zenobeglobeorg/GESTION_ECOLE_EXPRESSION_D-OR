import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as bulletinController from '../controllers/bulletinController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Récupérer un bulletin par ID
router.get('/:id', bulletinController.getBulletin);

// Récupérer les bulletins d'un élève
router.get('/student/:studentId', bulletinController.getStudentBulletins);

// Créer un bulletin (ADMINISTRATION ou SUPER_ADMIN)
router.post('/', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), bulletinController.createBulletin);

// Mettre à jour un bulletin (ADMINISTRATION ou SUPER_ADMIN)
router.put('/:id', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), bulletinController.updateBulletin);

// Supprimer un bulletin (ADMINISTRATION ou SUPER_ADMIN)
router.delete('/:id', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), bulletinController.deleteBulletin);

// Publier un bulletin (ADMINISTRATION ou SUPER_ADMIN)
router.patch('/:id/publish', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), bulletinController.publishBulletin);

// Dépublier un bulletin (ADMINISTRATION ou SUPER_ADMIN)
router.patch('/:id/unpublish', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), bulletinController.unpublishBulletin);

export default router;
