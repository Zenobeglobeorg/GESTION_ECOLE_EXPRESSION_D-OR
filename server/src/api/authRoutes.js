import express from 'express';
import { login, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route publique
router.post('/login', login);

// Route protégée
router.get('/me', authenticateToken, getCurrentUser);

export default router;


