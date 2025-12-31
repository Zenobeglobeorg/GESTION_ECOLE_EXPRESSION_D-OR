import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import * as userService from '../../services/userService';
import * as permissionService from '../../services/permissionService';
import type { Permission } from '../../services/roleService';

export const UsersPermissions = () => {
  const [users, setUsers] = useState<userService.UserWithDate[]>([]);
  const [permissions, setPermissions] = useState<Array<{ key: string; name: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, p] = await Promise.all([userService.getUsers(), permissionService.getPermissions()]);
        setUsers(u);
        setPermissions((p as Permission[]).map((x) => ({ key: x.key, name: x.name })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadUserPermissions = async (userId: number) => {
    setSelectedPerms([]);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const permissionKeys = (data.permissions || []).map((p: { key: string }) => p.key);
        setSelectedPerms(permissionKeys);
      }
    } catch (err) {
      console.warn('Could not load user permissions', err);
    }
  };

  const togglePerm = (key: string) => {
    setSelectedPerms(prev => (prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]));
  };

  const save = async () => {
    if (!selectedUserId) return alert('Sélectionnez un utilisateur');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/${selectedUserId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: selectedPerms }),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      alert('Permissions mises à jour');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <AdminLayout
      title="Gestion des Permissions Utilisateurs"
      subtitle="Sélectionnez un utilisateur puis attribuez-lui les permissions nécessaires."
    >
      <ProtectedContent permission="users.update" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de gérer les permissions des utilisateurs.
        </div>
      }>
        <Card className="border-0 shadow-lg max-w-5xl">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-blue-900" htmlFor="permissions-user">
              Utilisateur
            </label>
            <select
              id="permissions-user"
              className="form-control"
              value={selectedUserId ?? ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                setSelectedUserId(id);
                if (id) loadUserPermissions(id);
              }}
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.firstName ?? u.email} {u.lastName ?? ''}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-blue-900">Permissions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loading ? (
                <div className="text-blue-700">Chargement...</div>
              ) : (
                permissions.map(p => (
                  <label key={p.key} className="flex items-center gap-3 p-3 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedPerms.includes(p.key)}
                      onChange={() => togglePerm(p.key)}
                    />
                    <span className="text-sm text-blue-900">{p.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={save}
              className="bg-linear-to-r from-blue-600 via-blue-700 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </Card>
      </ProtectedContent>
    </AdminLayout>
  );
};

export default UsersPermissions;
