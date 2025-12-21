import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as replacementController from '../controllers/replacementController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes
router.get('/', replacementController.listReplacements);
router.get('/update-statuses', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), replacementController.updateReplacementStatuses);
router.get('/:id', replacementController.getReplacementById);
router.post('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), replacementController.createReplacement);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), replacementController.updateReplacement);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), replacementController.deleteReplacement);

export default router;

