import { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileSidebar } from '../../components/layout/MobileSidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import type { UserRole } from '../../contexts/AuthContext';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export const UsersManagementPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'ADMINISTRATION' as UserRole,
  });

  // Filtrer les utilisateurs par rôle
  const filteredUsers = selectedRole === 'ALL' 
    ? users 
    : users.filter(user => user.role === selectedRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Appel API pour créer l'utilisateur
    console.log('Créer utilisateur:', formData);
    setIsCreateModalOpen(false);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'ADMINISTRATION',
    });
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      // TODO: Appel API pour supprimer
      console.log('Supprimer utilisateur:', userId);
    }
  };

  const handleSuspend = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) {
      // TODO: Appel API pour suspendre
      console.log('Suspendre utilisateur:', userId);
    }
  };

  const roles: { value: UserRole; label: string; color: string; bgColor: string }[] = [
    { value: 'ADMINISTRATION', label: 'Administration', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    { value: 'TEACHER', label: 'Enseignant', color: 'text-green-800', bgColor: 'bg-green-100' },
    { value: 'PARENT', label: 'Parent', color: 'text-purple-800', bgColor: 'bg-purple-100' },
  ];

  const getRoleBadge = (role: UserRole) => {
    const roleInfo = roles.find(r => r.value === role) || roles[0];
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleInfo.bgColor} ${roleInfo.color}`}>
        {roleInfo.label}
      </span>
    );
  };

  const roleStats = {
    ALL: users.length,
    ADMINISTRATION: users.filter(u => u.role === 'ADMINISTRATION').length,
    TEACHER: users.filter(u => u.role === 'TEACHER').length,
    PARENT: users.filter(u => u.role === 'PARENT').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Utilisateurs</h1>
            <p className="text-gray-600">Créez et gérez tous les comptes utilisateurs du système</p>
          </div>

          {/* Statistiques par rôle */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" 
                  onClick={() => setSelectedRole('ALL')}>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{roleStats.ALL}</p>
              </div>
            </Card>
            {roles.map((role) => (
              <Card 
                key={role.value}
                className={`border-0 shadow-md cursor-pointer hover:shadow-lg transition-all ${
                  selectedRole === role.value ? 'ring-2 ring-yellow-400' : ''
                }`}
                onClick={() => setSelectedRole(role.value)}
              >
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">{role.label}s</p>
                  <p className="text-2xl font-bold" style={{ color: role.color.replace('text-', '') }}>{roleStats[role.value]}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Barre de recherche et filtres */}
          <Card className="mb-6 border-0 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={selectedRole === 'ALL' ? 'primary' : 'outline'}
                  onClick={() => setSelectedRole('ALL')}
                  size="sm"
                  style={selectedRole === 'ALL' ? { backgroundColor: '#fbbf24' } : {}}
                >
                  Tous
                </Button>
                {roles.map((role) => (
                  <Button
                    key={role.value}
                    variant={selectedRole === role.value ? 'primary' : 'outline'}
                    onClick={() => setSelectedRole(role.value)}
                    size="sm"
                    style={selectedRole === role.value ? { backgroundColor: '#fbbf24' } : {}}
                  >
                    {role.label}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                style={{ backgroundColor: '#fbbf24' }}
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvel Utilisateur
              </Button>
            </div>
          </Card>

          {/* Tableau des utilisateurs */}
          <Card className="border-0 shadow-lg">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">
                  {selectedRole === 'ALL' 
                    ? 'Aucun utilisateur créé' 
                    : `Aucun ${roles.find(r => r.value === selectedRole)?.label.toLowerCase()} créé`}
                </p>
                <p className="text-sm text-gray-400">Commencez par créer votre premier utilisateur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold mr-3">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              {user.phone && (
                                <div className="text-sm text-gray-500">{user.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Suspendre"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Modal de création */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer un Nouvel Utilisateur"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de Compte</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.role === 'ADMINISTRATION' && 'Les comptes Administration peuvent gérer les élèves, classes et valider les notes'}
              {formData.role === 'TEACHER' && 'Les enseignants peuvent saisir les notes et suivre les présences'}
              {formData.role === 'PARENT' && 'Les parents peuvent consulter les résultats de leurs enfants'}
            </p>
          </div>

          <Input
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={8}
            helperText="Minimum 8 caractères avec majuscule, minuscule et chiffre"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: '#fbbf24' }}
            >
              Créer le Compte
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

