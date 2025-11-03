import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as studentController from '../controllers/studentController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Seuls SUPER_ADMIN et ADMINISTRATION peuvent gérer les élèves
router.get('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), studentController.listStudents);
router.post('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), studentController.createStudent);
router.get('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'TEACHER', 'PARENT'), studentController.getStudentById);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), studentController.updateStudent);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), studentController.deleteStudent);

export default router;

