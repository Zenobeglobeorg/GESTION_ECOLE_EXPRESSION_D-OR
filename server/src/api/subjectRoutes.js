import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as subjectController from '../controllers/subjectController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes
router.get('/', subjectController.listSubjects);
router.get('/available', subjectController.listAvailableSubjects); // Liste des matières disponibles
router.post('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), subjectController.createSubject);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), subjectController.updateSubject);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), subjectController.deleteSubject);

export default router;

