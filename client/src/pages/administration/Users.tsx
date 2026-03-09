import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import * as userService from '../../services/userService';

interface UserStats {
  teachers: number;
  parents: number;
  admins: number;
  total: number;
}

export const Users = () => {
  const [stats, setStats] = useState<UserStats>({
    teachers: 0,
    parents: 0,
    admins: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentUsers, setRecentUsers] = useState<userService.UserWithDate[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await userService.getUsers();
        
        const statsData: UserStats = {
          teachers: users.filter(u => u.role === 'TEACHER').length,
          parents: users.filter(u => u.role === 'PARENT').length,
          admins: users.filter(u => u.role === 'ADMINISTRATION').length,
          total: users.length,
        };
        setStats(statsData);
        
        // Trier par date de création (plus récents en premier) et prendre les 3 premiers
        const sorted = [...users].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentUsers(sorted.slice(0, 3));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs';
        setError(errorMessage);
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: isLoading ? '--' : stats.total,
      icon: '👥',
      path: '/admin/users',
      description: 'Tous les comptes',
    },
    {
      title: 'Enseignants',
      value: isLoading ? '--' : stats.teachers,
      icon: '👨‍🏫',
      path: '/admin/users/teachers',
      description: 'Enseignants actifs',
    },
    {
      title: 'Parents',
      value: isLoading ? '--' : stats.parents,
      icon: '👨‍👩‍👧',
      path: '/admin/users/parents', 
      description: 'Familles inscrites',
    },
    {
      title: 'Administrateurs',
      value: isLoading ? '--' : stats.admins,
      icon: '👔',
      path: '/admin/users/admins',
      description: 'Comptes administration',
    },
  ];

  const categoryLinks = [
    { label: 'Enseignants', path: '/admin/users/teachers', count: stats.teachers, icon: '👨‍🏫', description: 'Gérer les enseignants' },
    { label: 'Parents', path: '/admin/users/parents', count: stats.parents, icon: '👨‍👩‍👧', description: 'Gérer les parents' },
    { label: 'Administrateurs', path: '/admin/users/admins', count: stats.admins, icon: '👔', description: 'Gérer les administrateurs' },
  ];

  return (
    <AdminLayout
      title="Gestion des Utilisateurs"
      subtitle="Synthèse des comptes et accès aux différentes catégories."
    >
      <ProtectedContent permission="users.read" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de consulter les utilisateurs.
        </div>
      }>
        {/* StatCards : style OverviewPage, jaune uniquement, cliquables */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {statCards.map((stat, index) => (
            <Link key={index} to={stat.path} className="block">
              <div className="rounded-xl bg-linear-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-4 text-white shadow-md hover:shadow-lg transition-shadow border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/25 flex items-center justify-center text-lg shrink-0">
                    {stat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-bold leading-tight">{stat.value}</p>
                    <p className="text-xs font-medium text-white/95 truncate" title={stat.title}>{stat.title}</p>
                    <p className="text-[11px] text-white/80 truncate" title={stat.description}>{stat.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Accès direct aux catégories : liens mis en avant */}
        <Card
          title="Accès direct aux catégories"
          className="border-0 shadow-lg mb-8"
          headerActions={<div className="w-1 h-8 rounded-full bg-yellow-400" />}
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Cliquez sur une catégorie pour accéder à la liste et aux actions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-4 p-5 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20 hover:border-yellow-400 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/30 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-400/20 dark:bg-yellow-600/30 flex items-center justify-center text-2xl shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{item.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isLoading ? '--' : item.count} {item.label.toLowerCase()} · {item.description}
                  </p>
                </div>
                <span className="text-yellow-600 dark:text-yellow-400 font-medium shrink-0">→</span>
              </Link>
            ))}
          </div>
        </Card>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <Card title="Utilisateurs récents" className="border-0 shadow-lg">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun utilisateur récent</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Type</th>
                <th>Date de création</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => {
                const roleLabels: Record<string, string> = {
                  TEACHER: 'Enseignant',
                  PARENT: 'Parent',
                  ADMINISTRATION: 'Administrateur',
                  SUPER_ADMIN: 'Super Admin',
                };
                return (
                  <tr key={user.id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{roleLabels[user.role] || user.role}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
      </ProtectedContent>
    </AdminLayout>
  );
};

