import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface Announcement {
  id: number;
  title: string;
  content: string;
  target: string;
  priority: 'normal' | 'high' | 'urgent';
  date: string;
  status: string;
}

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 1, title: 'Réunion parents-professeurs', content: 'Réunion prévue le 25 octobre à 18h', target: 'Tous les parents', priority: 'high', date: '2023-10-15', status: 'Envoyé' },
  ]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');
  const [priority, setPriority] = useState('normal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, content, target, priority, date: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Erreur création');
      const newAnn = await res.json();
      setAnnouncements([newAnn, ...announcements]);
      alert('Annonce envoyée');
      setTitle(''); setContent(''); setTarget('all'); setPriority('normal');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === 'urgent') return 'border-l-4 border-red-500 bg-red-50';
    if (p === 'high') return 'border-l-4 border-orange-500 bg-orange-50';
    return 'border-l-4 border-gray-400 bg-gray-50';
  };

  return (
    <AdminLayout
      title="Envoyer des annonces"
      subtitle="Informez rapidement les familles et l’équipe pédagogique."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-0 shadow-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="font-semibold text-lg text-blue-900">Nouvelle annonce</h2>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="announcement-title">Titre</label>
              <input className="form-control" id="announcement-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="announcement-content">Contenu</label>
              <textarea className="form-control" id="announcement-content" rows={3} value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="announcement-target">Destinataires</label>
              <select className="form-control" id="announcement-target" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="all">Tous les parents</option>
                <option value="teachers">Tous les enseignants</option>
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="announcement-priority">Priorité</label>
              <select className="form-control" id="announcement-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
              Envoyer l’annonce
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-lg">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-blue-900">Annonces ({announcements.length})</h2>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                onClick={() => alert("Exporter les annonces")}
              >
                Exporter
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {announcements.map(ann => (
                <div key={ann.id} className={`${getPriorityColor(ann.priority)} rounded-xl p-4 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-blue-900">{ann.title}</h4>
                      <p className="text-xs text-blue-700/80 mt-1">{ann.content}</p>
                    </div>
                    <span className="text-xs text-blue-700/60">{ann.date}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                      onClick={() => alert("Relancer l’annonce")}
                    >
                      Relancer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      onClick={() => alert("Supprimer l’annonce")}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-center text-blue-700/70 text-sm">Aucune annonce envoyée pour le moment.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
