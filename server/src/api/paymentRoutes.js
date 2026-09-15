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

// Liste des années académiques (pour le filtre et la réinitialisation)
router.get('/academic-years', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), paymentController.listAcademicYears);

// Démarrer l'année académique suivante - Super-Admin uniquement (impact global sur le système)
router.post('/academic-years/start-new', requireRole('SUPER_ADMIN'), paymentController.startNewAcademicYear);

// Réinitialiser (supprimer) tous les paiements d'une année académique - Super-Admin uniquement
router.delete('/reset', requireRole('SUPER_ADMIN'), paymentController.resetPaymentsForYear);

// Récupérer les paiements d'un élève
router.get('/student/:studentId', requireRole('ADMINISTRATION', 'SUPER_ADMIN', 'PARENT'), paymentController.getStudentPayments);

// Générer les paiements pour un élève
router.post('/student/:studentId/generate', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), paymentController.generatePaymentsForStudent);

// Enregistrer ou mettre à jour un paiement
router.put('/:paymentId', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), paymentController.recordPayment);

// Envoyer un rappel de paiement
router.post('/:paymentId/send-reminder', requireRole('ADMINISTRATION', 'SUPER_ADMIN'), paymentController.sendPaymentReminder);

export default router;


