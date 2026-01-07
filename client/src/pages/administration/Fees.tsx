import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import * as feesService from '../../services/feesService';
import * as classService from '../../services/classService';
import { useLanguage } from '../../contexts/LanguageContext';

export const Fees = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [payments, setPayments] = useState<feesService.Payment[]>([]);
  const [stats, setStats] = useState<feesService.PaymentStats>({ total: 0, paid: 0, pending: 0 });
  const [classes, setClasses] = useState<classService.Class[]>([]);
  
  // Vue active (table, student, calendar)
  const [activeView, setActiveView] = useState<'table' | 'student' | 'calendar'>('table');
  
  // Filtres
  const [classFilter, setClassFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Vue calendrier
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Modal de paiement
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<feesService.Payment | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paidDate: '',
    paymentMethod: '',
    receiptNumber: '',
    notes: '',
  });
  const [savingPayment, setSavingPayment] = useState(false);
  
  // Comptes bloqués
  const [blockedAccounts, setBlockedAccounts] = useState<Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isBlocked: boolean;
    students: Array<{
      id: number;
      firstName: string;
      lastName: string;
      payments: feesService.Payment[];
    }>;
  }>>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [showBlockedAccounts, setShowBlockedAccounts] = useState(false);

  // Charger les données
  useEffect(() => {
    loadData();
    loadBlockedAccounts();
  }, []);

  // Recharger les paiements quand les filtres changent
  useEffect(() => {
    if (!loading) {
      loadPayments();
    }
  }, [classFilter, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [paymentsData, statsData, classesData] = await Promise.all([
        feesService.getPayments(),
        feesService.getPaymentStats(),
        classService.getClasses(),
      ]);
      
      setPayments(paymentsData);
      setStats(statsData);
      setClasses(classesData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setError(null);
      const paymentsData = await feesService.getPayments({
        classId: classFilter || undefined,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setPayments(paymentsData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    }
  };

  const handleOpenPaymentModal = (payment: feesService.Payment) => {
    setSelectedPayment(payment);
    setPaymentForm({
      amount: payment.amount.toString(),
      paidDate: payment.paidDate 
        ? new Date(payment.paidDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      paymentMethod: payment.paymentMethod || '',
      receiptNumber: payment.receiptNumber || '',
      notes: payment.notes || '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
    setPaymentForm({
      amount: '',
      paidDate: '',
      paymentMethod: '',
      receiptNumber: '',
      notes: '',
    });
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      setSavingPayment(true);
      setError(null);
      
      await feesService.recordPayment({
        paymentId: selectedPayment.id,
        amount: parseFloat(paymentForm.amount),
        paidDate: paymentForm.paidDate,
        paymentMethod: paymentForm.paymentMethod || undefined,
        receiptNumber: paymentForm.receiptNumber || undefined,
        notes: paymentForm.notes || undefined,
      });

      setSuccess('Paiement enregistré avec succès');
      handleClosePaymentModal();
      await loadData(); // Recharger les données
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setSavingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'PAID') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    if (status === 'OVERDUE') return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'PAID') return 'Payé';
    if (status === 'OVERDUE') return 'En retard';
    return 'En attente';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Grouper les paiements par élève
  const paymentsByStudent = useMemo(() => {
    const grouped: { [key: number]: feesService.Payment[] } = {};
    payments.forEach((payment) => {
      const studentId = payment.student.id;
      if (!grouped[studentId]) {
        grouped[studentId] = [];
      }
      grouped[studentId].push(payment);
    });
    
    // Trier les paiements de chaque élève par numéro de tranche
    Object.keys(grouped).forEach((studentId) => {
      grouped[parseInt(studentId)].sort((a, b) => a.installmentNumber - b.installmentNumber);
    });
    
    return grouped;
  }, [payments]);

  // Calculer le total payé et en attente par élève
  const getStudentTotals = (studentPayments: feesService.Payment[]) => {
    const total = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const paid = studentPayments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = total - paid;
    return { total, paid, pending };
  };

  // Fonctions pour le calendrier
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getPaymentsForDay = (day: number | null) => {
    if (day === null) return [];
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentMonth.getFullYear()}-${month}-${dayStr}`;
    return payments.filter((payment) => {
      const dueDate = new Date(payment.dueDate).toISOString().split('T')[0];
      return dueDate === dateStr;
    });
  };

  const isToday = (day: number | null) => {
    if (day === null) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const handleToday = () => setCurrentMonth(new Date());

  const monthName = new Date(currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <AdminLayout
      title={t('fees.title') || 'Gestion des frais'}
      subtitle={t('fees.subtitle') || 'Suivez les paiements, relancez les familles et exportez les relevés.'}
    >
      <ProtectedContent permission="fees.manage" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de gérer les frais.
        </div>
      }>
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="max-w-7xl space-y-8">
        {/* Comptes bloqués */}
        {blockedAccounts.length > 0 && (
          <Card className="border-0 shadow-lg dark:bg-gray-800 border-l-4 border-l-red-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <span>🔒</span>
                    Comptes Bloqués ({blockedAccounts.length})
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Comptes parents bloqués en raison de paiements en retard
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBlockedAccounts(!showBlockedAccounts)}
                  className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400"
                >
                  {showBlockedAccounts ? 'Masquer' : 'Afficher'}
                </Button>
              </div>
              
              {showBlockedAccounts && (
                <div className="space-y-3 mt-4">
                  {blockedAccounts.map((parent) => {
                    const totalPending = parent.students.reduce((sum, student) => {
                      return sum + student.payments.reduce((pSum, p) => pSum + p.amount, 0);
                    }, 0);
                    
                    return (
                      <div
                        key={parent.id}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-900 dark:text-red-300">
                              {parent.firstName} {parent.lastName}
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-400">{parent.email}</p>
                            <div className="mt-2 space-y-1">
                              {parent.students.map((student) => (
                                <div key={student.id} className="text-sm text-gray-700 dark:text-gray-300">
                                  <span className="font-medium">{student.firstName} {student.lastName}</span>
                                  {' - '}
                                  <span className="text-red-600 dark:text-red-400">
                                    {student.payments.length} échéance{student.payments.length > 1 ? 's' : ''} en attente
                                  </span>
                                </div>
                              ))}
                            </div>
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mt-2">
                              Total en attente : {formatCurrency(totalPending)}
                            </p>
                          </div>
                          <ProtectedContent permission="fees.manage">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblockAccount(parent.id, `${parent.firstName} ${parent.lastName}`)}
                              className="border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                            >
                              Débloquer
                            </Button>
                          </ProtectedContent>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`border-0 shadow-lg bg-linear-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 text-white`}>
              <div className="p-4 text-center">
              <p className="text-3xl font-bold">{formatCurrency(stats.total)}</p>
              <p className="text-xs uppercase tracking-wide opacity-80">{t('fees.totalAmount') || 'Montant total'}</p>
              </div>
            </Card>
          <Card className={`border-0 shadow-lg bg-linear-to-br from-green-500 via-green-600 to-green-700 dark:from-green-700 dark:via-green-800 dark:to-green-900 text-white`}>
              <div className="p-4 text-center">
              <p className="text-3xl font-bold">{formatCurrency(stats.paid)}</p>
              <p className="text-xs uppercase tracking-wide opacity-80">{t('fees.paid') || 'Payés'}</p>
              </div>
            </Card>
          <Card className={`border-0 shadow-lg bg-linear-to-br from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800 text-white`}>
              <div className="p-4 text-center">
              <p className="text-3xl font-bold">{formatCurrency(stats.pending)}</p>
              <p className="text-xs uppercase tracking-wide opacity-80">{t('fees.pending') || 'En attente'}</p>
              </div>
            </Card>
          </div>

        {/* Historique des paiements */}
        <Card className="border-0 shadow-lg dark:bg-gray-800">
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">
                {t('fees.paymentHistory') || 'Historique des paiements'}
              </h2>
              
              {/* Boutons de vue */}
              <div className="flex gap-2">
                <Button
                  variant={activeView === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('table')}
                  className={activeView === 'table' 
                    ? 'bg-yellow-400 text-blue-900 border-yellow-400' 
                    : 'border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400'}
                >
                  📋 {t('fees.viewTable') || 'Tableau'}
                </Button>
                <Button
                  variant={activeView === 'student' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('student')}
                  className={activeView === 'student' 
                    ? 'bg-yellow-400 text-blue-900 border-yellow-400' 
                    : 'border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400'}
                >
                  👤 {t('fees.viewByStudent') || 'Par élève'}
                </Button>
                <Button
                  variant={activeView === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('calendar')}
                  className={activeView === 'calendar' 
                    ? 'bg-yellow-400 text-blue-900 border-yellow-400' 
                    : 'border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400'}
                >
                  📅 {t('fees.viewCalendar') || 'Calendrier'}
                </Button>
              </div>
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                  {t('fees.filterByClass') || 'Filtrer par classe'}
                </label>
                <select
                  title="Sélectionner une classe"
                  value={classFilter || ''}
                  onChange={(e) => setClassFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">{t('fees.allClasses') || 'Toutes les classes'}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.level})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                  {t('fees.searchByName') || 'Rechercher par nom'}
                </label>
                <Input
                  type="text"
                  placeholder={t('fees.searchPlaceholder') || 'Nom ou prénom...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                  {t('fees.filterByStatus') || 'Filtrer par statut'}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="all">{t('fees.allStatuses') || 'Tous les statuts'}</option>
                  <option value="paid">{t('fees.paid') || 'Payé'}</option>
                  <option value="pending">{t('fees.pending') || 'En attente'}</option>
                  <option value="overdue">{t('fees.overdue') || 'En retard'}</option>
                </select>
              </div>
            </div>

            {/* Contenu selon la vue active */}
            {loading ? (
              <div className="py-10 text-center text-blue-700 dark:text-blue-400">
                {t('common.loading') || 'Chargement...'}
              </div>
            ) : payments.length === 0 ? (
              <div className="py-12 text-center text-blue-900 dark:text-blue-400">
                <p className="font-semibold">{t('fees.noPayments') || 'Aucun paiement trouvé'}</p>
              </div>
            ) : activeView === 'table' ? (
              <>
                <div className="overflow-x-auto">
                  <table className="table dark:divide-gray-700">
                    <thead className="bg-blue-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          {t('fees.student') || 'Élève'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          {t('fees.class') || 'Classe'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          {t('fees.installment') || 'Tranche'}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          {t('fees.amount') || 'Montant'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          {t('fees.dueDate') || 'Date limite'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          {t('fees.paidDate') || 'Date de paiement'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          {t('fees.status') || 'Statut'}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          {t('fees.actions') || 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-blue-100 dark:divide-gray-700">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-blue-900 dark:text-blue-400">
                              {payment.student.firstName} {payment.student.lastName}
                            </div>
                            {payment.student.parent && (
                              <div className="text-xs text-blue-700/70 dark:text-blue-300/70">
                                {payment.student.parent.firstName} {payment.student.parent.lastName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {payment.student.class?.name || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-400">
                            {t('fees.installmentNumber') || 'Tranche'} {payment.installmentNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-blue-900 dark:text-blue-400">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-400">
                            {formatDate(payment.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-400">
                            {payment.paidDate ? formatDate(payment.paidDate) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(payment.status)}`}>
                              {getStatusLabel(payment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              {payment.status !== 'PAID' && (
                                <ProtectedContent permission="fees.manage">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      if (confirm(`Envoyer un rappel de paiement pour ${payment.student.firstName} ${payment.student.lastName} ?`)) {
                                        try {
                                          await feesService.sendPaymentReminder(payment.id);
                                          setSuccess('Rappel de paiement envoyé avec succès');
                                          setTimeout(() => setSuccess(null), 3000);
                                        } catch (err) {
                                          setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du rappel');
                                          setTimeout(() => setError(null), 5000);
                                        }
                                      }
                                    }}
                                    className="border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                    title="Envoyer un rappel au parent"
                                  >
                                    📧 Rappel
                                  </Button>
                                </ProtectedContent>
                              )}
                              <ProtectedContent permission="fees.manage">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenPaymentModal(payment)}
                                  className="border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 hover:border-yellow-500"
                                >
                                  {payment.status === 'PAID' 
                                    ? (t('fees.update') || 'Modifier')
                                    : (t('fees.record') || 'Enregistrer')}
                                </Button>
                              </ProtectedContent>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-end pt-4">
                  <ProtectedContent permission="fees.manage">
                    <Button 
                      className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                      onClick={() => alert(t('fees.exportFeature') || 'Fonctionnalité d\'export à implémenter')}
                    >
                      {t('fees.export') || 'Exporter les relevés'}
                    </Button>
                  </ProtectedContent>
                  <ProtectedContent permission="fees.manage">
                    <Button 
                      variant="outline" 
                      className="border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400"
                      onClick={() => alert(t('fees.reminderFeature') || 'Fonctionnalité de rappel à implémenter')}
                    >
                      {t('fees.sendReminder') || 'Envoyer un rappel'}
                    </Button>
                  </ProtectedContent>
                </div>
              </>
            ) : activeView === 'student' ? (
              /* Vue groupée par élève */
              <div className="space-y-4">
                {Object.entries(paymentsByStudent).map(([studentId, studentPayments]) => {
                  const student = studentPayments[0].student;
                  const totals = getStudentTotals(studentPayments);
                  
                  return (
                    <div
                      key={studentId}
                      className="bg-white dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 overflow-hidden"
                    >
                      {/* En-tête de l'élève */}
                      <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {student.firstName} {student.lastName}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
                                {student.class?.name || '—'}
                              </span>
                              {student.parent && (
                                <span className="text-sm text-white/80">
                                  Parent: {student.parent.firstName} {student.parent.lastName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-white/80">Total</div>
                            <div className="text-xl font-bold text-white">{formatCurrency(totals.total)}</div>
                            <div className="flex gap-3 mt-1 text-xs">
                              <span className="text-green-200">Payé: {formatCurrency(totals.paid)}</span>
                              <span className="text-yellow-200">En attente: {formatCurrency(totals.pending)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Liste des tranches */}
                      <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                            <thead className="bg-blue-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 dark:text-blue-400">
                                  {t('fees.installment') || 'Tranche'}
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-blue-900 dark:text-blue-400">
                                  {t('fees.amount') || 'Montant'}
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 dark:text-blue-400">
                                  {t('fees.dueDate') || 'Date limite'}
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 dark:text-blue-400">
                                  {t('fees.paidDate') || 'Date de paiement'}
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-900 dark:text-blue-400">
                                  {t('fees.status') || 'Statut'}
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-blue-900 dark:text-blue-400">
                                  {t('fees.actions') || 'Actions'}
                                </th>
                    </tr>
                  </thead>
                            <tbody className="divide-y divide-blue-100 dark:divide-gray-700">
                              {studentPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-yellow-50 dark:hover:bg-gray-600">
                                  <td className="px-4 py-2 text-blue-900 dark:text-blue-400">
                                    {t('fees.installmentNumber') || 'Tranche'} {payment.installmentNumber}
                                  </td>
                                  <td className="px-4 py-2 text-right font-semibold text-blue-900 dark:text-blue-400">
                                    {formatCurrency(payment.amount)}
                                  </td>
                                  <td className="px-4 py-2 text-blue-900 dark:text-blue-400">
                                    {formatDate(payment.dueDate)}
                                  </td>
                                  <td className="px-4 py-2 text-blue-900 dark:text-blue-400">
                                    {payment.paidDate ? formatDate(payment.paidDate) : '—'}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(payment.status)}`}>
                                      {getStatusLabel(payment.status)}
                          </span>
                        </td>
                                  <td className="px-4 py-2 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {payment.status !== 'PAID' && (
                                        <ProtectedContent permission="fees.manage">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                              if (confirm(`Envoyer un rappel de paiement pour ${payment.student.firstName} ${payment.student.lastName} ?`)) {
                                                try {
                                                  await feesService.sendPaymentReminder(payment.id);
                                                  setSuccess('Rappel de paiement envoyé avec succès');
                                                  setTimeout(() => setSuccess(null), 3000);
                                                  await loadData();
                                                } catch (err) {
                                                  setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du rappel');
                                                  setTimeout(() => setError(null), 5000);
                                                }
                                              }
                                            }}
                                            className="border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                            title="Envoyer un rappel au parent"
                                          >
                                            📧 Rappel
                                          </Button>
                                        </ProtectedContent>
                                      )}
                                      <ProtectedContent permission="fees.manage">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleOpenPaymentModal(payment)}
                                          className="border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                                        >
                                          {payment.status === 'PAID' 
                                            ? (t('fees.update') || 'Modifier')
                                            : (t('fees.record') || 'Enregistrer')}
                                        </Button>
                                      </ProtectedContent>
                                    </div>
                                  </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Vue calendrier */
              <div className="space-y-4">
                {/* Contrôles du calendrier */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevMonth}
                      className="border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400"
                    >
                      ←
                    </Button>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 capitalize">
                      {monthName}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextMonth}
                      className="border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400"
                    >
                      →
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    className="border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400"
                  >
                    {t('fees.today') || "Aujourd'hui"}
                  </Button>
                </div>
                
                {/* Calendrier */}
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 overflow-hidden">
                  {/* Jours de la semaine */}
                  <div className="grid grid-cols-7 bg-blue-50 dark:bg-gray-800">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                      <div
                        key={day}
                        className="px-4 py-2 text-center text-xs font-semibold text-blue-900 dark:text-blue-400"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Jours du mois */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`min-h-[100px] border border-blue-100 dark:border-gray-600 p-2 ${
                          day === null ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
                        } ${isToday(day || 0) ? 'ring-2 ring-yellow-400 dark:ring-yellow-600' : ''}`}
                      >
                        {day && (
                          <>
                            <div
                              className={`text-sm font-semibold mb-1 ${
                                isToday(day)
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-blue-900 dark:text-blue-400'
                              }`}
                            >
                              {day}
                            </div>
                            <div className="space-y-1">
                              {getPaymentsForDay(day).slice(0, 3).map((payment) => (
                                <div
                                  key={payment.id}
                                  className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                                    payment.status === 'PAID'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                      : payment.status === 'OVERDUE'
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                  }`}
                                  onClick={() => handleOpenPaymentModal(payment)}
                                  title={`${payment.student.firstName} ${payment.student.lastName} - ${formatCurrency(payment.amount)}`}
                                >
                                  <div className="truncate font-medium">
                                    {payment.student.firstName} {payment.student.lastName}
                                  </div>
                                  <div className="truncate">
                                    {formatCurrency(payment.amount)}
                                  </div>
                                </div>
                              ))}
                              {getPaymentsForDay(day).length > 3 && (
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  +{getPaymentsForDay(day).length - 3} {t('fees.more') || 'autres'}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Légende */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30"></div>
                    <span className="text-blue-900 dark:text-blue-400">{t('fees.paid') || 'Payé'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30"></div>
                    <span className="text-blue-900 dark:text-blue-400">{t('fees.pending') || 'En attente'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30"></div>
                    <span className="text-blue-900 dark:text-blue-400">{t('fees.overdue') || 'En retard'}</span>
                  </div>
                </div>
              </div>
            )}
            </div>
          </Card>
        </div>

      {/* Modal d'enregistrement de paiement */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        title={selectedPayment?.status === 'PAID' 
          ? (t('fees.updatePayment') || 'Modifier le paiement')
          : (t('fees.recordPayment') || 'Enregistrer un paiement')}
      >
        {selectedPayment && (
          <form onSubmit={handleSavePayment} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 dark:text-blue-400">
                <strong>{t('fees.student') || 'Élève'}:</strong> {selectedPayment.student.firstName} {selectedPayment.student.lastName}
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-400">
                <strong>{t('fees.installment') || 'Tranche'}:</strong> {t('fees.installmentNumber') || 'Tranche'} {selectedPayment.installmentNumber}
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-400">
                <strong>{t('fees.dueDate') || 'Date limite'}:</strong> {formatDate(selectedPayment.dueDate)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                {t('fees.amount') || 'Montant'} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                {t('fees.paidDate') || 'Date de paiement'} <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={paymentForm.paidDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paidDate: e.target.value })}
                required
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                {t('fees.paymentMethod') || 'Méthode de paiement'}
              </label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">{t('fees.selectMethod') || 'Sélectionner...'}</option>
                <option value="Banque">{t('fees.bank') || 'Banque'}</option>
                <option value="Espèces">{t('fees.cash') || 'Espèces'}</option>
                <option value="Chèque">{t('fees.check') || 'Chèque'}</option>
                <option value="Mobile Money">{t('fees.mobileMoney') || 'Mobile Money'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                {t('fees.receiptNumber') || 'Numéro de reçu'}
              </label>
              <Input
                type="text"
                value={paymentForm.receiptNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })}
                placeholder={t('fees.receiptPlaceholder') || 'Numéro du reçu bancaire...'}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                {t('fees.notes') || 'Notes'}
              </label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={3}
                className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder={t('fees.notesPlaceholder') || 'Notes supplémentaires...'}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClosePaymentModal}
                className="border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                {t('common.cancel') || 'Annuler'}
              </Button>
              <ProtectedContent permission="fees.manage">
                <Button
                  type="submit"
                  isLoading={savingPayment}
                  className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
                >
                  {savingPayment 
                    ? (t('common.saving') || 'Enregistrement...')
                    : (t('common.save') || 'Enregistrer')}
                </Button>
              </ProtectedContent>
            </div>
          </form>
        )}
      </Modal>
      </ProtectedContent>
    </AdminLayout>
  );
};
