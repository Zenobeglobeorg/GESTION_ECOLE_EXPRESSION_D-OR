import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as parentController from '../controllers/parentController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Recherche d'un parent (accessible à ADMIN et SUPER_ADMIN)
router.get('/search', requireRole('SUPER_ADMIN', 'ADMINISTRATION'), parentController.searchParent);

// Middleware pour vérifier que le parent accède à ses propres données
const checkParentAccess = (req, res, next) => {
  if (req.user.role === 'PARENT' && req.user.id !== Number(req.params.id)) {
    return res.status(403).json({ error: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres données.' });
  }
  next();
};

// Récupérer les enfants d'un parent (accessible au parent lui-même, aux admins et super-admin)
router.get('/:id/students', 
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'PARENT'),
  checkParentAccess,
  parentController.getParentChildren
);

// Récupérer un parent par ID
router.get('/:id', 
  requireRole('SUPER_ADMIN', 'ADMINISTRATION', 'PARENT'),
  checkParentAccess,
  parentController.getParentById
);

export default router;

