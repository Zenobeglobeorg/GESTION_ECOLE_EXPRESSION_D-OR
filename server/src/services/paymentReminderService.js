import { getPrisma } from '../utils/prisma.js';
import { createNotification } from '../controllers/notificationController.js';
import { getFinalPaymentDueDate } from '../utils/paymentUtils.js';

const prisma = getPrisma();

/**
 * Calcule le statut d'un paiement
 */
const calculatePaymentStatus = (dueDate, paidDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  
  if (paidDate) {
    return 'PAID';
  }
  
  if (now > due) {
    return 'OVERDUE';
  }
  
  return 'PENDING';
};

/**
 * Vérifie et bloque les comptes parents avec des paiements en retard après le 5 mars
 */
export const checkAndBlockOverdueAccounts = async () => {
  try {
    const finalDate = getFinalPaymentDueDate();
    const today = new Date();
    
    // Si on n'est pas encore au 5 mars, ne rien faire
    if (today < finalDate) {
      return { blocked: 0, checked: 0 };
    }
    
    // Récupérer tous les parents avec des enfants
    const parents = await prisma.user.findMany({
      where: {
        role: 'PARENT',
        isBlocked: false, // Ne pas re-vérifier les comptes déjà bloqués
      },
      include: {
        students: {
          include: {
            payments: true,
            class: {
              select: {
                name: true,
                level: true,
              },
            },
          },
        },
      },
    });
    
    let blockedCount = 0;
    
    for (const parent of parents) {
      // Vérifier si le parent a des paiements en retard
      let hasOverduePayments = false;
      
      for (const student of parent.students) {
        for (const payment of student.payments) {
          const status = calculatePaymentStatus(payment.dueDate, payment.paidDate);
          if (status === 'OVERDUE' || status === 'PENDING') {
            hasOverduePayments = true;
            break;
          }
        }
        if (hasOverduePayments) break;
      }
      
      // Si le parent a des paiements en retard après le 5 mars, bloquer le compte
      if (hasOverduePayments) {
        await prisma.user.update({
          where: { id: parent.id },
          data: { isBlocked: true },
        });
        
        blockedCount++;
        
        // Envoyer une notification au parent
        const finalDateFormatted = finalDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        
        await createNotification(
          parent.id,
          'PAYMENT',
          'Compte bloqué - Paiements en retard',
          `Votre compte a été bloqué en raison de paiements en retard après la date limite du ${finalDateFormatted}. Veuillez contacter l'administration pour régulariser votre situation.`,
          null,
          { reason: 'overdue_payments' }
        );
      }
    }
    
    return { blocked: blockedCount, checked: parents.length };
  } catch (error) {
    console.error('Erreur lors de la vérification des comptes en retard:', error);
    throw error;
  }
};

/**
 * Envoie des notifications automatiques de rappel de paiement
 * À appeler chaque semaine à partir de février jusqu'au 5 mars
 */
export const sendAutomaticPaymentReminders = async () => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const finalDate = getFinalPaymentDueDate();
    
    // Ne rien faire si on n'est pas en février ou mars
    if (currentMonth < 2) {
      return { sent: 0, checked: 0 };
    }
    
    // Si on est après le 5 mars, ne rien faire (les comptes seront bloqués)
    if (today > finalDate) {
      return { sent: 0, checked: 0 };
    }
    
    // Récupérer tous les paiements en attente
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: { not: 'PAID' },
        dueDate: { lte: finalDate },
      },
      include: {
        student: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isBlocked: true,
              },
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
      orderBy: { dueDate: 'asc' },
    });
    
    let sentCount = 0;
    const notifiedParents = new Set(); // Pour éviter les doublons
    
    for (const payment of pendingPayments) {
      // Ignorer si le parent est déjà bloqué
      if (payment.student.parent.isBlocked) {
        continue;
      }
      
      // Calculer le statut
      const status = calculatePaymentStatus(payment.dueDate, payment.paidDate);
      if (status === 'PAID') {
        continue;
      }
      
      // Calculer les jours jusqu'à la date limite
      const daysUntilFinal = Math.ceil((finalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculer le montant restant total pour cet élève
      const allPayments = await prisma.payment.findMany({
        where: {
          studentId: payment.studentId,
          status: { not: 'PAID' },
        },
      });
      
      const totalRemaining = allPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Créer une clé unique pour éviter les doublons (parent + semaine)
      const weekKey = `${payment.student.parent.id}_${Math.floor(daysUntilFinal / 7)}`;
      
      if (notifiedParents.has(weekKey)) {
        continue; // Déjà notifié cette semaine
      }
      
      const dueDateFormatted = new Date(payment.dueDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      
      let title, content;
      
      const finalDateFormatted = finalDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      
      if (daysUntilFinal <= 7) {
        // Dernière semaine - message urgent
        title = `⚠️ URGENT - Paiement en retard - ${payment.student.firstName} ${payment.student.lastName}`;
        content = `Bonjour ${payment.student.parent.firstName},\n\n` +
          `⚠️ URGENT : Il ne reste que ${daysUntilFinal} jour${daysUntilFinal > 1 ? 's' : ''} avant la date limite du ${finalDateFormatted}.\n\n` +
          `Une échéance de paiement est en attente pour ${payment.student.firstName} ${payment.student.lastName}.\n\n` +
          `📅 Date limite : ${dueDateFormatted}\n` +
          `💰 Montant de cette échéance : ${payment.amount.toLocaleString('fr-FR')} FCFA\n` +
          `📊 Montant total restant : ${totalRemaining.toLocaleString('fr-FR')} FCFA\n\n` +
          `⚠️ ATTENTION : Si le paiement n'est pas effectué avant le ${finalDateFormatted}, votre compte sera bloqué.\n\n` +
          `Merci de régulariser votre situation au plus vite.\n\n` +
          `Cordialement,\nL'équipe Expression d'Or`;
      } else if (daysUntilFinal <= 30) {
        // Moins d'un mois - message d'avertissement
        title = `Rappel de paiement - ${payment.student.firstName} ${payment.student.lastName}`;
        content = `Bonjour ${payment.student.parent.firstName},\n\n` +
          `Il reste ${daysUntilFinal} jour${daysUntilFinal > 1 ? 's' : ''} avant la date limite du ${finalDateFormatted}.\n\n` +
          `Une échéance de paiement est en attente pour ${payment.student.firstName} ${payment.student.lastName}.\n\n` +
          `📅 Date limite : ${dueDateFormatted}\n` +
          `💰 Montant de cette échéance : ${payment.amount.toLocaleString('fr-FR')} FCFA\n` +
          `📊 Montant total restant : ${totalRemaining.toLocaleString('fr-FR')} FCFA\n\n` +
          `Merci de régulariser votre situation au plus vite.\n\n` +
          `Cordialement,\nL'équipe Expression d'Or`;
      } else {
        // Plus d'un mois - rappel normal
        title = `Rappel de paiement - ${payment.student.firstName} ${payment.student.lastName}`;
        content = `Bonjour ${payment.student.parent.firstName},\n\n` +
          `Nous vous rappelons qu'une échéance de paiement est en attente pour ${payment.student.firstName} ${payment.student.lastName}.\n\n` +
          `📅 Date limite : ${dueDateFormatted}\n` +
          `💰 Montant de cette échéance : ${payment.amount.toLocaleString('fr-FR')} FCFA\n` +
          `📊 Montant total restant : ${totalRemaining.toLocaleString('fr-FR')} FCFA\n\n` +
          `Merci de régulariser votre situation.\n\n` +
          `Cordialement,\nL'équipe Expression d'Or`;
      }
      
      const studentName = `${payment.student.firstName} ${payment.student.lastName}`;
      
      // Envoyer la notification
      await createNotification(
        payment.student.parent.id,
        'PAYMENT',
        title,
        content,
        payment.id,
        {
          studentId: payment.student.id,
          studentName,
          amount: payment.amount,
          dueDate: payment.dueDate,
          totalRemaining,
          daysUntilFinal,
        }
      );
      
      // Envoyer l'email via EmailJS
      let emailSent = false;
      try {
        const { emailjsService } = await import('../services/emailjsService.js');
        const emailResult = await emailjsService.sendPaymentReminderEmail(
          payment.student.parent.email,
          payment.student.parent.firstName,
          studentName,
          payment.amount,
          payment.dueDate,
          totalRemaining,
          daysUntilFinal
        );
        emailSent = emailResult.success || false;
      } catch (emailError) {
        console.warn(`⚠️ Erreur lors de l'envoi de l'email pour ${payment.student.parent.email} (notification envoyée quand même):`, emailError);
        // On continue même si l'email échoue, la notification est déjà envoyée
      }
      
      // Enregistrer l'historique du rappel (automatique, donc sentBy = null)
      try {
        await prisma.paymentReminder.create({
          data: {
            paymentId: payment.id,
            userId: payment.student.parent.id,
            sentBy: null, // Automatique
            sentVia: emailSent ? 'both' : 'notification',
            emailSent,
          },
        });
      } catch (reminderError) {
        console.warn('⚠️ Erreur lors de l\'enregistrement de l\'historique du rappel:', reminderError);
      }
      
      notifiedParents.add(weekKey);
      sentCount++;
    }
    
    return { sent: sentCount, checked: pendingPayments.length };
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels automatiques:', error);
    throw error;
  }
};

