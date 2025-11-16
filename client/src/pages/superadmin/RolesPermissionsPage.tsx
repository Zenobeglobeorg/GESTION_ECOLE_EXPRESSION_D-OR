import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileSidebar } from '../../components/layout/MobileSidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import * as roleService from '../../services/roleService';
import * as permissionService from '../../services/permissionService';
import type { Permission, Role } from '../../services/roleService';

export const RolesPermissionsPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    selectedPermissions: [] as number[],
  });

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getRoles(),
        permissionService.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (roleFormData.selectedPermissions.length === 0) {
        throw new Error('Veuillez sélectionner au moins une permission');
      }
      await roleService.createRole({
        name: roleFormData.name,
        description: roleFormData.description,
        permissionIds: roleFormData.selectedPermissions,
      });
      setIsCreateRoleModalOpen(false);
      setRoleFormData({
        name: '',
        description: '',
        selectedPermissions: [],
      });
      await loadData(); // Recharger les données
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du rôle';
      setError(errorMessage);
      console.error('Erreur:', err);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    setRoleFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter(id => id !== permissionId)
        : [...prev.selectedPermissions, permissionId],
    }));
  };

  const handleDeleteRole = async (roleId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ? Les utilisateurs avec ce rôle devront être réassignés.')) {
      try {
        setError(null);
        await roleService.deleteRole(roleId);
        if (selectedRole?.id === roleId) {
          setSelectedRole(null);
        }
        await loadData(); // Recharger les données
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du rôle';
        setError(errorMessage);
        console.error('Erreur:', err);
      }
    }
  };

  const categories = [
    { key: 'users', label: 'Gestion des Utilisateurs', icon: '👥' },
    { key: 'students', label: 'Gestion des Élèves', icon: '🎓' },
    { key: 'academic', label: 'Gestion Académique', icon: '📚' },
    { key: 'administration', label: 'Administration', icon: '⚙️' },
    { key: 'system', label: 'Système', icon: '🔧' },
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Rôles et Permissions</h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                {roles.length} rôle(s)
              </span>
            </div>
            <p className="text-gray-600">Définissez les rôles personnalisés et leurs permissions pour l'administration</p>
          </div>

          {/* Barre d'actions */}
          <div className="mb-6 flex items-center justify-end">
            <Button
              onClick={() => setIsCreateRoleModalOpen(true)}
              style={{ backgroundColor: '#fbbf24' }}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau Rôle
            </Button>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des Rôles */}
            <div className="lg:col-span-1">
              <Card title="Rôles Créés" className="border-0 shadow-lg">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Chargement...</p>
                  </div>
                ) : roles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Aucun rôle personnalisé créé</p>
                    <p className="text-gray-400 text-xs mt-1">Créez votre premier rôle</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedRole?.id === role.id
                            ? 'bg-yellow-50 border-2 border-yellow-400'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{role.name}</h3>
                            {role.description && (
                              <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {role.permissions.length} permission(s)
                            </p>
                          </div>
                          <button
                            title="Supprimer le rôle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Détails du Rôle Sélectionné */}
            <div className="lg:col-span-2">
              {selectedRole ? (
                <Card
                  title={`Rôle : ${selectedRole.name}`}
                  className="border-0 shadow-lg"
                  headerActions={
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {selectedRole.permissions.length} permission(s)
                    </span>
                  }
                >
                  {selectedRole.description && (
                    <p className="text-gray-600 mb-6">{selectedRole.description}</p>
                  )}

                  <div className="space-y-6">
                    {categories.map((category) => {
                      const categoryPerms = selectedRole.permissions.filter(
                        p => p.category === category.key
                      );
                      if (categoryPerms.length === 0) return null;

                      return (
                        <div key={category.key}>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </h4>
                          <div className="space-y-2">
                            {categoryPerms.map((perm) => (
                              <div
                                key={perm.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{perm.name}</p>
                                  {perm.description && (
                                    <p className="text-xs text-gray-500">{perm.description}</p>
                                  )}
                                </div>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  ✓ Activée
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">Aucun rôle sélectionné</p>
                    <p className="text-sm text-gray-400">Sélectionnez un rôle pour voir ses permissions</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de création de rôle */}
      <Modal
        isOpen={isCreateRoleModalOpen}
        onClose={() => setIsCreateRoleModalOpen(false)}
        title="Créer un Nouveau Rôle"
        size="xl"
      >
        <form onSubmit={handleCreateRole} className="space-y-6">
          <Input
            label="Nom du Rôle"
            value={roleFormData.name}
            onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
            placeholder="Ex: Directeur, Secrétaire, Comptable..."
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={roleFormData.description}
              onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Description du rôle et de ses responsabilités..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Permissions ({roleFormData.selectedPermissions.length} sélectionnée(s))
            </label>
            
            <div className="max-h-96 overflow-y-auto space-y-6 border border-gray-200 rounded-lg p-4">
              {categories.map((category) => {
                const categoryPerms = permissions.filter(p => p.category === category.key);
                
                return (
                  <div key={category.key}>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.label}
                    </h4>
                    <div className="space-y-2">
                      {categoryPerms.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={roleFormData.selectedPermissions.includes(perm.id)}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{perm.name}</p>
                            {perm.description && (
                              <p className="text-xs text-gray-500 mt-1">{perm.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateRoleModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: '#fbbf24' }}
              disabled={roleFormData.name === '' || roleFormData.selectedPermissions.length === 0}
            >
              Créer le Rôle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

