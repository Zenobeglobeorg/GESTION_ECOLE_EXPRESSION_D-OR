import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface Fee {
  id: number;
  name: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
}

export const Fees = () => {
  const [fees] = useState<Fee[]>([
    { id: 1, name: 'Inscription', amount: 50000, status: 'paid', dueDate: '2024-09-01' },
    { id: 2, name: 'Scolarité', amount: 100000, status: 'pending', dueDate: '2025-01-15' },
    { id: 3, name: 'Lunch', amount: 20000, status: 'overdue', dueDate: '2024-12-31' },
  ]);
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-800';
    if (status === 'overdue') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  

  const filteredFees = statusFilter === 'all' ? fees : fees.filter(f => f.status === statusFilter);

  return (
    <AdminLayout
      title="Gestion des frais"
      subtitle="Suivez les paiements, relancez les familles et exportez les relevés."
    >
      <div className="max-w-6xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Montant total", value: "170 000 F", color: "from-blue-500 via-blue-600 to-blue-700" },
            { label: "Payés", value: "50 000 F", color: "from-green-500 via-green-600 to-green-700" },
            { label: "En attente", value: "120 000 F", color: "from-yellow-400 via-yellow-500 to-yellow-600" },
          ].map((stat) => (
            <Card key={stat.label} className={`border-0 shadow-lg bg-linear-to-br ${stat.color} text-white`}>
              <div className="p-4 text-center">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide opacity-80">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-lg">
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <h2 className="font-semibold text-lg text-blue-900">Historique des paiements</h2>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-control md:w-52">
                <option value="all">Tous les statuts</option>
                <option value="paid">Payé</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Libellé</th>
                    <th className="text-right">Montant</th>
                    <th>Statut</th>
                    <th>Date limite</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map(fee => (
                    <tr key={fee.id}>
                      <td>{fee.name}</td>
                      <td className="text-right font-semibold">{fee.amount.toLocaleString()} F</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(fee.status)}`}>
                          {fee.status === 'paid' ? 'Payé' : fee.status === 'overdue' ? 'En retard' : 'En attente'}
                        </span>
                      </td>
                      <td className="text-xs">{fee.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              <Button className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                Exporter les relevés
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400">
                Envoyer un rappel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

