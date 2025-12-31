import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import * as announcementService from '../../services/announcementService';
import * as classService from '../../services/classService';

interface ClassOption {
  id: number;
  name: string;
}

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<announcementService.Announcement[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'ALL_PARENTS' | 'ALL_TEACHERS' | 'ALL_USERS' | 'SPECIFIC_CLASS'>('ALL_PARENTS');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les annonces et classes au montage
  useEffect(() => {
    loadAnnouncements();
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Erreur lors du chargement des classes:', err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (target === 'SPECIFIC_CLASS' && selectedClassIds.length === 0) {
        setError('Veuillez sélectionner au moins une classe');
        setIsSubmitting(false);
        return;
      }

      const newAnn = await announcementService.createAnnouncement({
        title,
        content,
        target,
        priority,
        classIds: target === 'SPECIFIC_CLASS' ? selectedClassIds : undefined,
      });
      setAnnouncements([newAnn, ...announcements]);
      setSuccess('Annonce envoyée avec succès !');
      setTitle('');
      setContent('');
      setTarget('ALL_PARENTS');
      setPriority('NORMAL');
      setSelectedClassIds([]);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'annonce');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClassToggle = (classId: number) => {
    setSelectedClassIds(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      setError(null);
      await announcementService.deleteAnnouncement(id);
      setAnnouncements(announcements.filter(ann => ann.id !== id));
      setSuccess('Annonce supprimée avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'annonce');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleResend = async (id: number) => {
    try {
      setError(null);
      const newAnn = await announcementService.resendAnnouncement(id);
      setAnnouncements([newAnn, ...announcements]);
      setSuccess('Annonce relancée avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la relance de l\'annonce');
      setTimeout(() => setError(null), 5000);
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === 'URGENT') {
      return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600';
    }
    if (p === 'HIGH') {
      return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600';
    }
    return 'border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-600';
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'ALL_PARENTS':
        return 'Tous les parents';
      case 'ALL_TEACHERS':
        return 'Tous les enseignants';
      case 'ALL_USERS':
        return 'Tous les utilisateurs';
      default:
        return target;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'Urgente';
      case 'HIGH':
        return 'Haute';
      case 'NORMAL':
        return 'Normale';
      default:
        return priority;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Envoyer des annonces" subtitle="Informez rapidement les familles et l'équipe pédagogique.">
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600 dark:text-blue-400">Chargement...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Envoyer des annonces" subtitle="Informez rapidement les familles et l'équipe pédagogique.">
      <ProtectedContent permission="announcements.create" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de créer des annonces.
        </div>
      }>
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProtectedContent permission="announcements.create">
            <Card className="border-0 shadow-lg dark:bg-gray-800">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">Nouvelle annonce</h2>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="announcement-title">
                Titre
              </label>
              <input
                className="form-control"
                id="announcement-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="announcement-content">
                Contenu
              </label>
              <textarea
                className="form-control"
                id="announcement-content"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="announcement-target">
                Destinataires
              </label>
              <select
                className="form-control"
                id="announcement-target"
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value as 'ALL_PARENTS' | 'ALL_TEACHERS' | 'ALL_USERS' | 'SPECIFIC_CLASS');
                  if (e.target.value !== 'SPECIFIC_CLASS') {
                    setSelectedClassIds([]);
                  }
                }}
                disabled={isSubmitting}
              >
                <option value="ALL_PARENTS">Tous les parents</option>
                <option value="ALL_TEACHERS">Tous les enseignants</option>
                <option value="ALL_USERS">Tous les utilisateurs</option>
                <option value="SPECIFIC_CLASS">Classes spécifiques</option>
              </select>
            </div>

            {target === 'SPECIFIC_CLASS' && (
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400">
                  Sélectionner les classes
                </label>
                <div className="max-h-48 overflow-y-auto border border-blue-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
                  {classes.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucune classe disponible</p>
                  ) : (
                    classes.map(classe => (
                      <label key={classe.id} className="flex items-center gap-2 cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(classe.id)}
                          onChange={() => handleClassToggle(classe.id)}
                          className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-blue-900 dark:text-blue-400">{classe.name}</span>
                      </label>
                    ))
                  )}
                </div>
                {selectedClassIds.length > 0 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {selectedClassIds.length} classe{selectedClassIds.length > 1 ? 's' : ''} sélectionnée{selectedClassIds.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="announcement-priority">
                Priorité
              </label>
              <select
                className="form-control"
                id="announcement-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'NORMAL' | 'HIGH' | 'URGENT')}
                disabled={isSubmitting}
              >
                <option value="NORMAL">Normale</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Envoi en cours...' : "Envoyer l'annonce"}
                </Button>
              </form>
            </Card>
          </ProtectedContent>

        <Card className="lg:col-span-2 border-0 shadow-lg dark:bg-gray-800">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-400">
                Annonces ({announcements.length})
              </h2>
              <Button
                variant="outline"
                className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 dark:hover:border-blue-500"
                onClick={() => {
                  // Fonctionnalité d'export à implémenter
                  alert('Fonctionnalité d\'export à venir');
                }}
              >
                Exporter
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {announcements.map((ann) => (
                <div key={ann.id} className={`${getPriorityColor(ann.priority)} rounded-xl p-4 shadow-sm`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-400">{ann.title}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          {getPriorityLabel(ann.priority)}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1">{ann.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-blue-600/70 dark:text-blue-400/70">
                        <span>📧 {getTargetLabel(ann.target)}</span>
                        {ann.sentAt && <span>📅 {formatDate(ann.sentAt)}</span>}
                        {ann.createdBy && (
                          <span>
                            👤 {ann.createdBy.firstName} {ann.createdBy.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <ProtectedContent permission="announcements.create">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 dark:hover:border-blue-500"
                        onClick={() => handleResend(ann.id)}
                      >
                        Relancer
                      </Button>
                    </ProtectedContent>
                    <ProtectedContent permission="announcements.create">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-500"
                        onClick={() => handleDelete(ann.id)}
                      >
                        Supprimer
                      </Button>
                    </ProtectedContent>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-center text-blue-700/70 dark:text-blue-300/70 text-sm py-8">
                  Aucune annonce envoyée pour le moment.
                </p>
              )}
            </div>
          </div>
        </Card>
        </div>
      </ProtectedContent>
    </AdminLayout>
  );
};
