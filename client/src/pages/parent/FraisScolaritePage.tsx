// Enregistrez ce fichier sous: src/pages/parent/FraisScolaritePage.tsx

import React from 'react';
// Importez Card si vous l'utilisez, sinon les styles sont inline
// import { Card } from '../../components/ui/Card'; 

// --- DONNÉES FACTICES (MOCK DATA) ---
const mockInvoices = [
  { id: 'T1', name: 'Tranche 1', amount: 150000, status: 'Payé', date: '01 Oct 2024' },
  { id: 'T2', name: 'Tranche 2', amount: 150000, status: 'En attente', date: '15 Jan 2025' },
  { id: 'T3', name: 'Tranche 3', amount: 150000, status: 'À venir', date: '15 Avr 2025' },
];

const mockHistory = [
  { id: 'P1', date: '01 Oct 2024', amount: 150000, method: 'Virement Bancaire', receiptUrl: '#' },
];

const totalDue = 450000;
const totalPaid = 150000;
// ---

const FraisScolaritePage: React.FC = () => {

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

      {/* 2. Cartes Résumé (style de ParentDashboardHome) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Solde Restant Dû (Jaune) */}
        <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
          <p className="text-sm text-white text-opacity-90 mb-1">Solde Restant Dû</p>
          <p className="text-3xl font-bold">{(totalDue - totalPaid).toLocaleString()} F CFA</p>
        </div>
        {/* Total Payé (Vert) */}
        <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm text-white text-opacity-90 mb-1">Total Payé</p>
          <p className="text-3xl font-bold">{totalPaid.toLocaleString()} F CFA</p>
        </div>
        {/* Prochain Paiement (Bleu) */}
        <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm text-white text-opacity-90 mb-1">Prochain Paiement</p>
          <p className="text-3xl font-bold">{mockInvoices[1].amount.toLocaleString()} F CFA</p>
          <p className="text-xs text-white text-opacity-75 mt-1">Avant le {mockInvoices[1].date}</p>
        </div>
      </div>

      {/* 3. Échéancier des paiements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-800">Échéancier des paiements</h3>
        </div>
        <div className="p-6 space-y-4">
          {mockInvoices.map((invoice) => (
            <div key={invoice.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex-1 mb-3 sm:mb-0">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                    invoice.status === 'Payé' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status}
                  </span>
                  <h4 className="font-semibold text-gray-800">{invoice.name}</h4>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Montant : <span className="font-medium text-gray-700">{invoice.amount.toLocaleString()} F CFA</span>
                  <span className="mx-2">|</span>
                  Échéance : <span className="font-medium text-gray-700">{invoice.date}</span>
                </p>
              </div>
              {invoice.status === 'En attente' && (
                // (Couleur : Bouton Bleu, style de ProfilParentPage)
                <button className="flex-shrink-0 px-5 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-center">
                  Payer maintenant
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Historique des transactions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-800">Historique des transactions</h3>
        </div>
        
        {/* Tableau responsive */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reçu</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockHistory.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">Paiement - {payment.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{payment.amount.toLocaleString()} F CFA</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {/* (Couleur : Lien Jaune/Bleu) */}
                    <a href={payment.receiptUrl} download className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                      Télécharger
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mockHistory.length === 0 && (
          <p className="p-6 text-sm text-gray-500 italic">Aucun paiement enregistré pour le moment.</p>
        )}
      </div>

    </div>
  );
};

export default FraisScolaritePage;