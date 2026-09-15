import { jsPDF } from 'jspdf';
import type { Payment } from '../services/feesService';
import type { Student } from '../services/studentService';

const formatCurrency = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} F CFA`;

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Génère et télécharge un reçu PDF pour un paiement payé.
 */
export const generatePaymentReceiptPDF = (payment: Payment, student: Student) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;
  let y = 20;

  // En-tête école
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // bleu
  doc.text("École Expression d'Or", pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Reçu de paiement des frais de scolarité', pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setDrawColor(220);
  doc.line(marginX, y, pageWidth - marginX, y);

  // Numéro de reçu / date d'émission
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Reçu N° ${payment.receiptNumber || `P${payment.id}`}`, marginX, y);
  doc.text(`Émis le ${formatDate(new Date().toISOString())}`, pageWidth - marginX, y, { align: 'right' });

  // Infos élève
  y += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('Élève', marginX, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30);
  doc.text(`${student.firstName} ${student.lastName}`, marginX, y);
  if (student.class?.name) {
    y += 5;
    doc.text(`Classe : ${student.class.name}`, marginX, y);
  }

  // Détails du paiement
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('Détails du paiement', marginX, y);
  y += 8;

  const rows: [string, string][] = [
    ['Tranche', `Tranche ${payment.installmentNumber}`],
    ['Montant', formatCurrency(payment.amount)],
    ['Date de paiement', formatDate(payment.paidDate)],
    ['Méthode de paiement', payment.paymentMethod || 'Non spécifiée'],
  ];

  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90);
    doc.text(label, marginX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    doc.text(value, pageWidth - marginX, y, { align: 'right' });
    y += 6;
  });

  // Montant encadré
  y += 6;
  doc.setDrawColor(30, 58, 138);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, 14, 2, 2, 'FD');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('Montant payé', marginX + 4, y + 9);
  doc.text(formatCurrency(payment.amount), pageWidth - marginX - 4, y + 9, { align: 'right' });

  // Pied de page
  y += 26;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(140);
  doc.text('Ce reçu est généré automatiquement et fait foi de paiement.', pageWidth / 2, y, { align: 'center' });

  const fileName = `recu-${student.lastName}-${student.firstName}-tranche${payment.installmentNumber}.pdf`
    .toLowerCase()
    .replace(/\s+/g, '-');
  doc.save(fileName);
};
