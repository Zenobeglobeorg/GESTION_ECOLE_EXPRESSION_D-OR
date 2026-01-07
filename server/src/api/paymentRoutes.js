import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Récupérer tous les paiements (avec filtres)
router.get('/', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), paymentController.getPayments);

// Récupérer les statistiques
router.get('/stats', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), paymentController.getPaymentStats);

// Récupérer les paiements d'un élève
router.get('/student/:studentId', requireRole('ADMINISTRATION', 'SUPER_ADMIN', 'PARENT'), paymentController.getStudentPayments);

// Générer les paiements pour un élève
router.post('/student/:studentId/generate', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), paymentController.generatePaymentsForStudent);

// Enregistrer ou mettre à jour un paiement
router.put('/:paymentId', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), paymentController.recordPayment);

// Envoyer un rappel de paiement
router.post('/:paymentId/send-reminder', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), paymentController.sendPaymentReminder);

export default router;


