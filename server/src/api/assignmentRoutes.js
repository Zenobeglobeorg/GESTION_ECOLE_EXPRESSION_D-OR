import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as assignmentController from '../controllers/assignmentController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Récupérer les devoirs pour une classe (admin/teacher)
router.get('/class/:classId', requireRole('ADMINISTRATION', 'SUPER_ADMIN', 'TEACHER'), assignmentController.getAssignments);

// Récupérer les devoirs pour un enseignant
router.get('/teacher', requireRole('TEACHER'), assignmentController.getTeacherAssignments);

// Récupérer les devoirs pour un parent
router.get('/parent', requireRole('PARENT'), assignmentController.getParentAssignments);

// Créer un nouveau devoir
router.post('/', requireRole('TEACHER', 'ADMINISTRATION', 'SUPER_ADMIN'), assignmentController.createAssignment);

// Mettre à jour un devoir
router.put('/:assignmentId', requireRole('TEACHER', 'ADMINISTRATION', 'SUPER_ADMIN'), assignmentController.updateAssignment);

// Supprimer un devoir
router.delete('/:assignmentId', requireRole('TEACHER', 'ADMINISTRATION', 'SUPER_ADMIN'), assignmentController.deleteAssignment);

export default router;

