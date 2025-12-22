import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../utils/prisma.js';

const prisma = getPrisma();

/**
 * Calcule le montant annuel selon le niveau de classe
 * CM2 : 30 000 F × 9 mois = 270 000 F
 * Autres : 25 000 F × 9 mois = 225 000 F
 */
const getAnnualAmount = (level) => {
  const levelUpper = level?.toUpperCase() || '';
  
  // CM2 : 30 000 F × 9 = 270 000 F
  if (levelUpper.includes('CM2')) {
    return 270000;
  }
  
  // Maternelle, Pré-maternelle, SIL, CP, CE1, CE2, CM1 : 25 000 F × 9 = 225 000 F
  if (
    levelUpper.includes('MATERNELLE') ||
    levelUpper.includes('PRE-PRIMAIRE') ||
    levelUpper.includes('PRÉ-PRIMAIRE') ||
    levelUpper.includes('SIL') ||
    levelUpper.includes('CP') ||
    levelUpper.includes('CE1') ||
    levelUpper.includes('CE2') ||
    levelUpper.includes('CM1')
  ) {
    return 225000;
  }
  
  // Par défaut : 225 000 F (25 000 F × 9)
  return 225000;
};

/**
 * Calcule le montant du premier paiement (inscription)
 * CM2 : 30 000 F
 * Autres : 25 000 F
 */
const getFirstPaymentAmount = (level) => {
  const levelUpper = level?.toUpperCase() || '';
  
  // CM2 : 30 000 F
  if (levelUpper.includes('CM2')) {
    return 30000;
  }
  
  // Autres : 25 000 F
  return 25000;
};

/**
 * Calcule les dates et montants des paiements selon l'option choisie
 * Date limite finale : 05 MARS 2026
 * 
 * Logique :
 * - Premier paiement : 25 000 F (ou 30 000 F pour CM2) payé à l'inscription
 * - Reste : réparti sur les échéances restantes jusqu'au 5 mars 2026
 */
const calculatePaymentSchedule = (paymentOption, enrollmentDate, level) => {
  const annualAmount = getAnnualAmount(level);
  const firstPaymentAmount = getFirstPaymentAmount(level);
  const remainingAmount = annualAmount - firstPaymentAmount; // Montant restant à payer
  
  const finalDueDate = new Date('2026-03-05');
  const enrollment = new Date(enrollmentDate);
  
  // Date de début pour les échéances : le 5 du mois suivant l'inscription
  const startDate = new Date(enrollment);
  startDate.setMonth(startDate.getMonth() + 1);
  startDate.setDate(5);
  
  const schedule = [];
  
  // Premier paiement : payé à l'inscription
  schedule.push({
    installmentNumber: 1,
    amount: firstPaymentAmount,
    dueDate: new Date(enrollment), // Date d'inscription
    isFirstPayment: true,
  });
  
  // Calculer les échéances restantes selon l'option
  if (paymentOption === 'MONTHLY') {
    // Option 1 : Mensuel (le 5 de chaque mois jusqu'au 5 mars)
    let currentDate = new Date(startDate);
    let installment = 2; // Commence à 2 car le premier est déjà créé
    
    // Compter combien de mois restent jusqu'au 5 mars
    const monthsUntilMarch = [];
    let checkDate = new Date(startDate);
    while (checkDate <= finalDueDate) {
      monthsUntilMarch.push(new Date(checkDate));
      checkDate.setMonth(checkDate.getMonth() + 1);
    }
    
    const numberOfPayments = monthsUntilMarch.length;
    if (numberOfPayments > 0) {
      const monthlyAmount = Math.round(remainingAmount / numberOfPayments);
      let totalDistributed = 0;
      
      monthsUntilMarch.forEach((date, index) => {
        // Pour le dernier paiement, ajuster pour que la somme soit exacte
        const isLast = index === monthsUntilMarch.length - 1;
        const amount = isLast 
          ? remainingAmount - totalDistributed 
          : monthlyAmount;
        
        schedule.push({
          installmentNumber: installment,
          amount: amount,
          dueDate: new Date(date),
          isFirstPayment: false,
        });
        
        totalDistributed += amount;
        installment++;
      });
    }
    
  } else if (paymentOption === 'QUARTERLY') {
    // Option 2 : Trimestriel (le 5 du 1er mois du trimestre jusqu'au 5 mars)
    let currentDate = new Date(startDate);
    let installment = 2;
    
    // Compter combien de trimestres restent jusqu'au 5 mars
    const quartersUntilMarch = [];
    let checkDate = new Date(startDate);
    while (checkDate <= finalDueDate) {
      quartersUntilMarch.push(new Date(checkDate));
      checkDate.setMonth(checkDate.getMonth() + 3);
    }
    
    const numberOfPayments = quartersUntilMarch.length;
    if (numberOfPayments > 0) {
      const quarterlyAmount = Math.round(remainingAmount / numberOfPayments);
      let totalDistributed = 0;
      
      quartersUntilMarch.forEach((date, index) => {
        // Pour le dernier paiement, ajuster pour que la somme soit exacte
        const isLast = index === quartersUntilMarch.length - 1;
        const amount = isLast 
          ? remainingAmount - totalDistributed 
          : quarterlyAmount;
        
        schedule.push({
          installmentNumber: installment,
          amount: amount,
          dueDate: new Date(date),
          isFirstPayment: false,
        });
        
        totalDistributed += amount;
        installment++;
      });
    }
    
  } else if (paymentOption === 'ANNUAL') {
    // Option 3 : Une ou deux tranches (dernière échéance le 5 mars)
    schedule.push({
      installmentNumber: 2,
      amount: remainingAmount,
      dueDate: finalDueDate, // 5 mars 2026
      isFirstPayment: false,
    });
  }
  
  return schedule;
};

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
 * Récupère tous les paiements avec filtres
 */
export const getPayments = async (req, res) => {
  try {
    const { classId, search, status } = req.query;
    
    const where = {};
    
    if (classId) {
      where.student = {
        classId: parseInt(classId),
      };
    }
    
    if (search) {
      where.student = {
        ...where.student,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { installmentNumber: 'asc' },
      ],
    });
    
    // Recalculer les statuts pour les paiements non payés
    const paymentsWithStatus = payments.map((payment) => {
      const status = calculatePaymentStatus(payment.dueDate, payment.paidDate);
      return {
        ...payment,
        status,
      };
    });
    
    res.json(paymentsWithStatus);
  } catch (err) {
    console.error('getPayments error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
  }
};

/**
 * Récupère les statistiques des paiements
 */
export const getPaymentStats = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
    });
    
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    
    payments.forEach((payment) => {
      totalAmount += payment.amount;
      const status = calculatePaymentStatus(payment.dueDate, payment.paidDate);
      if (status === 'PAID') {
        paidAmount += payment.amount;
      } else {
        pendingAmount += payment.amount;
      }
    });
    
    res.json({
      total: Math.round(totalAmount),
      paid: Math.round(paidAmount),
      pending: Math.round(pendingAmount),
    });
  } catch (err) {
    console.error('getPaymentStats error:', err);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
};

/**
 * Crée les paiements pour un élève lors de l'inscription
 * Cette fonction est exportée pour être utilisée dans studentController
 * 
 * Logique :
 * - Premier paiement (25 000 ou 30 000 F) : PAYÉ à l'inscription
 * - Autres paiements : PENDING avec dates d'échéance
 */
export const createPaymentsForStudent = async (studentId, paymentOption, enrollmentDate, level) => {
  const schedule = calculatePaymentSchedule(paymentOption, enrollmentDate, level);
  
  // Créer tous les paiements en une seule transaction pour éviter les problèmes de pool
  // Utiliser une transaction interactive Prisma pour créer tous les paiements atomiquement
  try {
    const payments = await prisma.$transaction(async (tx) => {
      const createdPayments = [];
      for (const item of schedule) {
        const payment = await tx.payment.create({
          data: {
            studentId,
            amount: item.amount,
            dueDate: item.dueDate,
            installmentNumber: item.installmentNumber,
            // Le premier paiement est payé à l'inscription, les autres sont en attente
            status: item.isFirstPayment ? 'PAID' : 'PENDING',
            paidDate: item.isFirstPayment ? new Date(enrollmentDate) : null,
          },
        });
        createdPayments.push(payment);
      }
      return createdPayments;
    }, {
      timeout: 30000, // 30 secondes de timeout
      maxWait: 10000, // Attendre max 10s pour obtenir une connexion
    });
    
    return payments;
  } catch (error) {
    console.error('Erreur lors de la création des paiements dans la transaction:', error);
    console.error('Détails:', error.message);
    // Fallback: créer les paiements séquentiellement avec un délai entre chaque
    const payments = [];
    for (const item of schedule) {
      try {
        const payment = await prisma.payment.create({
          data: {
            studentId,
            amount: item.amount,
            dueDate: item.dueDate,
            installmentNumber: item.installmentNumber,
            status: item.isFirstPayment ? 'PAID' : 'PENDING',
            paidDate: item.isFirstPayment ? new Date(enrollmentDate) : null,
          },
        });
        payments.push(payment);
        // Petit délai entre chaque création pour éviter la surcharge du pool
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (err) {
        console.error(`Erreur lors de la création du paiement ${item.installmentNumber}:`, err);
        // Continuer avec les autres paiements
      }
    }
    return payments;
  }
};

/**
 * Enregistre ou met à jour un paiement
 */
export const recordPayment = async (req, res) => {
  try {
    const { paymentId, amount, paidDate, paymentMethod, receiptNumber, notes } = req.body;
    
    if (!paymentId || !amount || !paidDate) {
      return res.status(400).json({ error: 'paymentId, amount et paidDate sont requis' });
    }
    
    const payment = await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        amount: parseFloat(amount),
        paidDate: new Date(paidDate),
        status: 'PAID',
        paymentMethod: paymentMethod || null,
        receiptNumber: receiptNumber || null,
        notes: notes || null,
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
    });
    
    res.json(payment);
  } catch (err) {
    console.error('recordPayment error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du paiement' });
  }
};

/**
 * Récupère les paiements d'un élève
 */
export const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const payments = await prisma.payment.findMany({
      where: {
        studentId: parseInt(studentId),
      },
      orderBy: [
        { installmentNumber: 'asc' },
        { dueDate: 'asc' },
      ],
    });
    
    // Recalculer les statuts
    const paymentsWithStatus = payments.map((payment) => {
      const status = calculatePaymentStatus(payment.dueDate, payment.paidDate);
      return {
        ...payment,
        status,
      };
    });
    
    res.json(paymentsWithStatus);
  } catch (err) {
    console.error('getStudentPayments error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des paiements de l\'élève' });
  }
};

/**
 * Génère les paiements pour un élève existant (si nécessaire)
 */
export const generatePaymentsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      include: {
        class: true,
        payments: true,
      },
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Élève non trouvé' });
    }
    
    // Vérifier si des paiements existent déjà
    if (student.payments && student.payments.length > 0) {
      return res.status(400).json({ error: 'Des paiements existent déjà pour cet élève' });
    }
    
    // Générer les paiements
    const payments = await createPaymentsForStudent(
      student.id,
      student.paymentOption,
      student.enrollmentDate,
      student.class?.level
    );
    
    res.json(payments);
  } catch (err) {
    console.error('generatePaymentsForStudent error:', err);
    res.status(500).json({ error: 'Erreur lors de la génération des paiements' });
  }
};

