import React, { useState, useEffect, useMemo } from 'react';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import * as feesService from '../../services/feesService';

const FraisScolaritePage: React.FC = () => {
  const { selectedChild } = useSelectedChild();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<feesService.Payment[]>([]);

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Fonction pour formater les montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  // Charger les paiements de l'enfant sélectionné
  useEffect(() => {
    const loadPayments = async () => {
      if (!selectedChild) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const paymentsData = await feesService.getStudentPayments(selectedChild.id);
        // Trier par numéro de tranche
        paymentsData.sort((a, b) => a.installmentNumber - b.installmentNumber);
        setPayments(paymentsData);
      } catch (err) {
        console.error('Erreur lors du chargement des paiements:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des paiements');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [selectedChild]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const paid = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = total - paid;
    return { total, paid, pending };
  }, [payments]);

  // Obtenir le prochain paiement (premier en attente ou en retard)
  const nextPayment = useMemo(() => {
    const pendingOrOverdue = payments.find(
      (p) => p.status === 'PENDING' || p.status === 'OVERDUE'
    );
    return pendingOrOverdue || null;
  }, [payments]);

  // Transformer les paiements en "invoices" pour l'affichage
  const invoices = useMemo(() => {
    return payments.map((payment) => ({
      id: payment.id.toString(),
      name: `Tranche ${payment.installmentNumber}`,
      amount: payment.amount,
      status: payment.status === 'PAID' ? 'Payé' : payment.status === 'OVERDUE' ? 'En retard' : 'En attente',
      date: formatDate(payment.dueDate),
      payment: payment,
    }));
  }, [payments]);

  // Historique des paiements (uniquement les payés)
  const paymentHistory = useMemo(() => {
    return payments
      .filter((p) => p.status === 'PAID' && p.paidDate)
      .sort((a, b) => {
        const dateA = new Date(a.paidDate || '').getTime();
        const dateB = new Date(b.paidDate || '').getTime();
        return dateB - dateA; // Plus récent en premier
      })
      .map((payment) => ({
        id: payment.id.toString(),
        date: formatDate(payment.paidDate || ''),
        amount: payment.amount,
        method: payment.paymentMethod || 'Non spécifié',
        receiptNumber: payment.receiptNumber || '',
        payment: payment,
      }));
  }, [payments]);

  // Gérer l'état sans enfant sélectionné
  if (!selectedChild) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-1">Frais de Scolarité</h2>
          <p className="text-sm text-gray-600">Veuillez sélectionner un enfant pour voir ses frais de scolarité.</p>
        </div>
      </div>
    );
  }

  return (
    // On utilise un layout à plusieurs cartes, comme le Dashboard
    <div className="space-y-6">

      {/* 1. En-tête de la page */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {/* (Couleur : Titre Bleu, comme ProfilParentPage) */}
        <h2 className="text-xl font-bold text-blue-900 mb-1">
          Frais de Scolarité
        </h2>
        <p className="text-sm text-gray-600">Suivez et gérez vos paiements scolaires.</p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 2. Cartes Résumé (style de ParentDashboardHome) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl shadow-lg bg-gray-200 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
          <div className="p-6 rounded-xl shadow-lg bg-gray-200 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
          <div className="p-6 rounded-xl shadow-lg bg-gray-200 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Solde Restant Dû (Jaune) */}
          <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
            <p className="text-sm text-white text-opacity-90 mb-1">Solde Restant Dû</p>
            <p className="text-3xl font-bold">{formatCurrency(stats.pending)}</p>
          </div>
          {/* Total Payé (Vert) */}
          <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-sm text-white text-opacity-90 mb-1">Total Payé</p>
            <p className="text-3xl font-bold">{formatCurrency(stats.paid)}</p>
          </div>
          {/* Prochain Paiement (Bleu) */}
          <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-sm text-white text-opacity-90 mb-1">Prochain Paiement</p>
            {nextPayment ? (
              <>
                <p className="text-3xl font-bold">{formatCurrency(nextPayment.amount)}</p>
                <p className="text-xs text-white text-opacity-75 mt-1">Avant le {formatDate(nextPayment.dueDate)}</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">0 F CFA</p>
                <p className="text-xs text-white text-opacity-75 mt-1">Aucun paiement en attente</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. Échéancier des paiements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-800">Échéancier des paiements</h3>
        </div>
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>Aucun paiement trouvé pour cet élève.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex-1 mb-3 sm:mb-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                      invoice.status === 'Payé' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'En retard' ? 'bg-red-100 text-red-800' :
                      invoice.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status}
                    </span>
                    <h4 className="font-semibold text-gray-800">{invoice.name}</h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Montant : <span className="font-medium text-gray-700">{formatCurrency(invoice.amount)}</span>
                    <span className="mx-2">|</span>
                    Échéance : <span className="font-medium text-gray-700">{invoice.date}</span>
                    {invoice.payment.paidDate && (
                      <>
                        <span className="mx-2">|</span>
                        Payé le : <span className="font-medium text-gray-700">{formatDate(invoice.payment.paidDate)}</span>
                      </>
                    )}
                  </p>
                </div>
                {(invoice.status === 'En attente' || invoice.status === 'En retard') && (
                  <button 
                    className="flex-shrink-0 px-5 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-center"
                    onClick={() => {
                      // TODO: Implémenter la fonctionnalité de paiement
                      alert('Fonctionnalité de paiement à implémenter');
                    }}
                  >
                    Payer maintenant
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Historique des transactions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-800">Historique des transactions</h3>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          </div>
        ) : paymentHistory.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 italic">Aucun paiement enregistré pour le moment.</p>
        ) : (
          <>
            {/* Tableau responsive */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Reçu</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        Paiement - Tranche {payment.payment.installmentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.method}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {payment.receiptNumber || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default FraisScolaritePage;