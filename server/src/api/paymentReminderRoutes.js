import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import * as paymentReminderService from '../services/paymentReminderService.js';

const router = express.Router();

// Route pour déclencher manuellement la vérification et le blocage des comptes
router.post('/check-and-block', authenticateToken, requireRole('ADMINISTRATION', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const result = await paymentReminderService.checkAndBlockOverdueAccounts();
    res.json({
      success: true,
      message: `${result.blocked} compte(s) bloqué(s) sur ${result.checked} vérifié(s)`,
      ...result,
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des comptes:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification des comptes' });
  }
});

// Route pour déclencher manuellement l'envoi des rappels automatiques
router.post('/send-automatic-reminders', authenticateToken, requireRole('ADMINISTRATION', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const result = await paymentReminderService.sendAutomaticPaymentReminders();
    res.json({
      success: true,
      message: `${result.sent} rappel(s) envoyé(s)`,
      ...result,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi des rappels' });
  }
});

// Route pour récupérer les comptes bloqués
router.get('/blocked-accounts', authenticateToken, requireRole('ADMINISTRATION', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { getPrisma } = await import('../utils/prisma.js');
    const prisma = getPrisma();
    
    const blockedParents = await prisma.user.findMany({
      where: {
        role: 'PARENT',
        isBlocked: true,
      },
      include: {
        students: {
          include: {
            payments: {
              where: {
                status: { not: 'PAID' },
              },
              orderBy: { dueDate: 'asc' },
            },
            class: {
              select: {
                name: true,
                level: true,
              },
            },
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
    
    res.json(blockedParents);
  } catch (error) {
    console.error('Erreur lors de la récupération des comptes bloqués:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des comptes bloqués' });
  }
});

// Route pour récupérer l'historique des rappels
router.get('/reminder-history/:paymentId?', authenticateToken, requireRole('ADMINISTRATION', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { getPrisma } = await import('../utils/prisma.js');
    const prisma = getPrisma();
    
    const where = {};
    if (paymentId) {
      where.paymentId = parseInt(paymentId);
    }
    
    const reminders = await prisma.paymentReminder.findMany({
      where,
      include: {
        payment: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: paymentId ? undefined : 100, // Limiter à 100 si pas de filtre
    });
    
    res.json(reminders);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

// Route pour débloquer un compte parent
router.post('/unblock-account/:userId', authenticateToken, requireRole('ADMINISTRATION', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { getPrisma } = await import('../utils/prisma.js');
    const prisma = getPrisma();
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        students: {
          include: {
            payments: {
              where: {
                status: { not: 'PAID' },
              },
            },
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    if (user.role !== 'PARENT') {
      return res.status(400).json({ error: 'Seuls les comptes parents peuvent être débloqués' });
    }
    
    if (!user.isBlocked) {
      return res.status(400).json({ error: 'Ce compte n\'est pas bloqué' });
    }
    
    // Débloquer le compte
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isBlocked: false },
    });
    
    // Envoyer une notification au parent
    const { createNotification } = await import('../controllers/notificationController.js');
    await createNotification(
      user.id,
      'PAYMENT',
      'Compte débloqué',
      `Votre compte a été débloqué. Vous pouvez maintenant accéder à votre espace parent.`,
      null,
      { reason: 'account_unblocked' }
    );
    
    res.json({
      success: true,
      message: 'Compte débloqué avec succès',
    });
  } catch (error) {
    console.error('Erreur lors du déblocage du compte:', error);
    res.status(500).json({ error: 'Erreur lors du déblocage du compte' });
  }
});

export default router;

