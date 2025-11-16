import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface UserStats {
  teachers: number;
  parents: number;
  admins: number;
  total: number;
}

export const Users = () => {
  
  const [stats] = useState<UserStats>({
    teachers: 24,
    parents: 156,
    admins: 3,
    total: 183,
  });

  const statCards = [
    {
      label: 'Total Utilisateurs',
      value: stats.total,
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
    },
    {
      label: 'Enseignants',
      value: stats.teachers,
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    },
    {
      label: 'Parents',
      value: stats.parents,
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
    },
    {
      label: 'Administrateurs',
      value: stats.admins,
      gradient: 'from-yellow-500 via-yellow-600 to-yellow-700',
    },
  ];

  return (
    <AdminLayout
      title="Gestion des Utilisateurs"
      subtitle="Synthèse des comptes et accès aux différentes catégories."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className={`overflow-hidden border-0 bg-linear-to-br ${card.gradient} shadow-lg text-white`}
          >
            <div className="p-6 text-center space-y-2">
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-sm text-white/80">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card
        title="Accès direct aux catégories"
        className="border-0 shadow-lg"
        headerActions={<div className="w-1 h-8 rounded-full bg-yellow-400" />}
      >
        <p className="text-blue-900 mb-6">
          Sélectionnez un type d&apos;utilisateur pour accéder aux fonctionnalités détaillées.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/users/teachers"
            className="p-5 rounded-xl border border-blue-100 bg-white hover:border-yellow-300 hover:shadow-lg transition-all"
          >
            <h3 className="font-semibold text-lg text-blue-900 mb-2">Enseignants</h3>
            <p className="text-sm text-blue-700/80">{stats.teachers} enseignants enregistrés</p>
            <p className="text-sm mt-3 font-semibold text-yellow-700">Gérer les enseignants →</p>
          </Link>

          <Link
            to="/admin/users/parents"
            className="p-5 rounded-xl border border-blue-100 bg-white hover:border-yellow-300 hover:shadow-lg transition-all"
          >
            <h3 className="font-semibold text-lg text-blue-900 mb-2">Parents</h3>
            <p className="text-sm text-blue-700/80">{stats.parents} parents enregistrés</p>
            <p className="text-sm mt-3 font-semibold text-yellow-700">Gérer les parents →</p>
          </Link>

          <Link
            to="/admin/users/admins"
            className="p-5 rounded-xl border border-blue-100 bg-white hover:border-yellow-300 hover:shadow-lg transition-all"
          >
            <h3 className="font-semibold text-lg text-blue-900 mb-2">Administrateurs</h3>
            <p className="text-sm text-blue-700/80">{stats.admins} administrateurs</p>
            <p className="text-sm mt-3 font-semibold text-yellow-700">Gérer les administrateurs →</p>
          </Link>
        </div>
      </Card>

      <Card title="Utilisateurs récents" className="border-0 shadow-lg">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Type</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Mr. Dupont', email: 'dupont@ecole.fr', type: 'Enseignant', status: 'Actif' },
              { name: 'Mme. Bernard', email: 'bernard@ecole.fr', type: 'Enseignant', status: 'Actif' },
              { name: 'Ahmed Ali', email: 'ali.ahmed@email.com', type: 'Parent', status: 'Actif' },
            ].map((user, idx) => (
              <tr key={idx}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.type}</td>
                <td>
                  <span className="status active">{user.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminLayout>
  );
};

