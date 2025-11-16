import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface NotificationConfig { id: string; name: string; description: string; enabled: boolean }

export const Notifications = () => {
  const [pedagogical, setPedagogical] = useState<NotificationConfig[]>([
    { id: 'new_grade', name: 'Nouvelle note publiée', description: 'Alerté lorsqu\'une note est publiée', enabled: true },
    { id: 'report_card', name: 'Bulletin disponible', description: 'Notifier les parents du bulletin', enabled: true },
  ]);
  const [presence, setPresence] = useState<NotificationConfig[]>([
    { id: 'absence', name: 'Absence non justifiée', description: 'Après 3 absences', enabled: true },
    { id: 'late', name: 'Retard important', description: 'Au-delà de 30 minutes', enabled: false },
  ]);

  const toggleNotification = (id: string, category: 'pedagogical' | 'presence') => {
    if (category === 'pedagogical') {
      setPedagogical(pedagogical.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
    } else {
      setPresence(presence.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
    }
  };

  return (
    <AdminLayout
      title="Gestion des notifications"
      subtitle="Activez ou désactivez les alertes automatiques envoyées aux familles."
    >
      <div className="max-w-4xl space-y-6">
        <Card title="Notifications pédagogiques" className="border-0 shadow-lg">
          <div className="p-4 space-y-3">
            {pedagogical.map(notif => (
              <div key={notif.id} className="flex justify-between items-start p-3 border border-blue-100 rounded-xl bg-blue-50/60 hover:border-yellow-300 hover:bg-yellow-50 transition">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-blue-900">{notif.name}</h4>
                  <p className="text-xs text-blue-700/80">{notif.description}</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-blue-900">
                  <input type="checkbox" checked={notif.enabled} onChange={() => toggleNotification(notif.id, 'pedagogical')} />
                  <span>{notif.enabled ? 'Activé' : 'Désactivé'}</span>
                </label>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Notifications de présence" className="border-0 shadow-lg">
          <div className="p-4 space-y-3">
            {presence.map(notif => (
              <div key={notif.id} className="flex justify-between items-start p-3 border border-blue-100 rounded-xl bg-blue-50/60 hover:border-yellow-300 hover:bg-yellow-50 transition">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-blue-900">{notif.name}</h4>
                  <p className="text-xs text-blue-700/80">{notif.description}</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-blue-900">
                  <input type="checkbox" checked={notif.enabled} onChange={() => toggleNotification(notif.id, 'presence')} />
                  <span>{notif.enabled ? 'Activé' : 'Désactivé'}</span>
                </label>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="p-4 flex flex-wrap gap-3 justify-end">
            <Button className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
              Sauvegarder la configuration
            </Button>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400">
              Voir les historiques d'envoi
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
