import express from 'express';
import { login, verifyTwoFactor, getCurrentUser, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.post('/login', login);
router.post('/verify-2fa', verifyTwoFactor);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Routes protégées
router.get('/me', authenticateToken, getCurrentUser);
router.post('/change-password', authenticateToken, changePassword);

export default router;


