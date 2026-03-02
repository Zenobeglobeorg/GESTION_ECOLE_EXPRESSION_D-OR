import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as gradeController from '../controllers/gradeController.js';

const router = express.Router();
router.use(authenticateToken);

// Route pour les parents : récupérer les notes de leurs enfants
router.get('/my-children', requireRole('PARENT'), gradeController.getMyChildrenGrades);

// Routes pour les notes
router.get('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'), gradeController.listGrades);
router.get('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'), gradeController.getGradeById);
router.post('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'), gradeController.createGrade);
router.post('/bulk', requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'), gradeController.createBulkGrades);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER'), gradeController.updateGrade);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), gradeController.deleteGrade);

// Routes pour la validation/rejet des notes
router.post('/:id/validate', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), gradeController.validateGrade);
router.post('/:id/reject', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), gradeController.rejectGrade);
router.post('/:id/notify-teacher', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), gradeController.notifyTeacherForGrade);
router.post('/validate-all', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), gradeController.validateAllPendingGrades);

export default router;



