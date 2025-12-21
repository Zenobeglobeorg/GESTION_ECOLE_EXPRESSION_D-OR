import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as evaluationController from '../controllers/evaluationController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes
router.get('/', evaluationController.listEvaluations);
router.get('/:id', evaluationController.getEvaluationById);
router.post('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), evaluationController.createEvaluation);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), evaluationController.updateEvaluation);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), evaluationController.deleteEvaluation);

export default router;







