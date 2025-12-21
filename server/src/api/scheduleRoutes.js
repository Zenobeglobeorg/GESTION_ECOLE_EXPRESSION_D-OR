import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as scheduleController from '../controllers/scheduleController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes
router.get('/', scheduleController.listSchedules);
router.get('/:id', scheduleController.getScheduleById);
router.post('/', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), scheduleController.createSchedule);
router.post('/bulk', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), scheduleController.createBulkSchedules);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), scheduleController.updateSchedule);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), scheduleController.deleteSchedule);

// Routes pour les créneaux horaires personnalisés
// GET accessible aux enseignants et parents (lecture seule)
router.get('/class/:classId/time-slots', scheduleController.getClassTimeSlots);
// PUT réservé aux administrateurs (modification)
router.put('/class/:classId/time-slots', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), scheduleController.saveClassTimeSlots);

export default router;

