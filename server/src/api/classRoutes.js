import express from 'express';
import {
  listClasses,
  getClassById,
  findOrCreateClass,
  createClass,
  updateClass,
  deleteClass,
  getMyClasses,
} from '../controllers/classController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes
router.get('/my-classes', getMyClasses); // Route pour les enseignants - doit être avant /:id
router.get('/', listClasses);
router.get('/:id', getClassById);
router.post('/find-or-create', findOrCreateClass);
router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

export default router;

