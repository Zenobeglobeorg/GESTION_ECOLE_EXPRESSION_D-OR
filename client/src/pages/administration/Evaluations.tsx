import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { AdminLayout } from '../../components/admin/AdminLayout';
import * as evaluationService from '../../services/evaluationService';
import * as classService from '../../services/classService';
import * as subjectService from '../../services/subjectService';

interface Subject {
  id: number;
  name: string;
}

export const Evaluations = () => {
  const [evaluations, setEvaluations] = useState<evaluationService.Evaluation[]>([]);
  const [classes, setClasses] = useState<classService.Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [evalName, setEvalName] = useState('');
  const [evalType, setEvalType] = useState('devoir');
  const [evalClass, setEvalClass] = useState<number | ''>('');
  const [evalSubject, setEvalSubject] = useState<number | ''>('');
  const [evalDate, setEvalDate] = useState('');
  const [evalCoefficient, setEvalCoefficient] = useState(1);
  const [evalDescription, setEvalDescription] = useState('');
  const [notifyParents, setNotifyParents] = useState(false);

  // Edit state
  const [editingEvaluation, setEditingEvaluation] = useState<evaluationService.Evaluation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'devoir',
    classId: '' as number | '',
    subjectId: '' as number | '',
    date: '',
    coefficient: 1,
    description: '',
    notifyParents: false,
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [evaluationsData, classesData, subjectsData] = await Promise.all([
        evaluationService.getEvaluations(),
        classService.getClasses(),
        subjectService.getSubjects(),
      ]);
      setEvaluations(evaluationsData);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const newEval = await evaluationService.createEvaluation({
        name: evalName,
        type: evalType,
        classId: evalClass ? Number(evalClass) : undefined,
        subjectId: evalSubject ? Number(evalSubject) : undefined,
        date: evalDate,
        coefficient: evalCoefficient,
        description: evalDescription || undefined,
        notifyParents,
      });

      setSuccess('Évaluation créée avec succès');
      setEvalName('');
      setEvalType('devoir');
      setEvalClass('');
      setEvalSubject('');
      setEvalDate('');
      setEvalCoefficient(1);
      setEvalDescription('');
      setNotifyParents(false);
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'évaluation';
      setError(errorMessage);
      console.error('Error creating evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evaluation: evaluationService.Evaluation) => {
    setEditingEvaluation(evaluation);
    setEditForm({
      name: evaluation.name,
      type: evaluation.type,
      classId: evaluation.classId || '',
      subjectId: evaluation.subjectId || '',
      date: evaluation.date,
      coefficient: evaluation.coefficient,
      description: evaluation.description || '',
      notifyParents: evaluation.notifyParents || false,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvaluation) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await evaluationService.updateEvaluation(editingEvaluation.id, {
        name: editForm.name,
        type: editForm.type,
        classId: editForm.classId ? Number(editForm.classId) : undefined,
        subjectId: editForm.subjectId ? Number(editForm.subjectId) : undefined,
        date: editForm.date,
        coefficient: editForm.coefficient,
        description: editForm.description || undefined,
        notifyParents: editForm.notifyParents,
      });

      setSuccess('Évaluation modifiée avec succès');
      setIsEditModalOpen(false);
      setEditingEvaluation(null);
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de l\'évaluation';
      setError(errorMessage);
      console.error('Error updating evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvaluation = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await evaluationService.deleteEvaluation(id);
      setSuccess('Évaluation supprimée avec succès');
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Error deleting evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = new Date(currentYear, currentMonth).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      devoir: 'Devoir',
      examen: 'Examen',
      interrogation: 'Interrogation',
      tp: 'TP/Projet',
    };
    return types[type] || type;
  };

  return (
    <AdminLayout
      title="Planification des Évaluations"
      subtitle="Créer et gérer les évaluations et examens"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-0 shadow-lg">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-6 py-4 rounded-t-lg mb-4">
              <h2 className="font-semibold text-lg text-blue-900 text-center">Créer une évaluation</h2>
            </div>
            <form onSubmit={handleCreateEvaluation} className="p-4 space-y-3">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="eval-name">Nom</label>
                <Input
                  id="eval-name"
                  placeholder="Devoir surveillé n°1"
                  value={evalName}
                  onChange={(e) => setEvalName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="eval-type">Type</label>
                <select
                  title="Sélectionner le type"
                  className="form-control"
                  id="eval-type"
                  value={evalType}
                  onChange={(e) => setEvalType(e.target.value)}
                >
                  <option value="devoir">Devoir</option>
                  <option value="examen">Examen</option>
                  <option value="interrogation">Interrogation</option>
                  <option value="tp">TP/Projet</option>
                </select>
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="eval-class">Classe</label>
                <select
                  title="Sélectionner la classe"
                  className="form-control"
                  id="eval-class"
                  value={String(evalClass)}
                  onChange={(e) => setEvalClass(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Sélectionner (optionnel)</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="eval-subject">Matière</label>
                <select
                  title="Sélectionner la matière"
                  className="form-control"
                  id="eval-subject"
                  value={String(evalSubject)}
                  onChange={(e) => setEvalSubject(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Sélectionner (optionnel)</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="eval-date">Date</label>
                <Input
                  type="date"
                  id="eval-date"
                  value={evalDate}
                  onChange={(e) => setEvalDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="eval-coef">Coefficient</label>
                <Input
                  type="number"
                  id="eval-coef"
                  min="1"
                  max="10"
                  value={evalCoefficient}
                  onChange={(e) => setEvalCoefficient(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 mb-2 block" htmlFor="eval-desc">Description</label>
                <textarea
                  className="form-control"
                  id="eval-desc"
                  rows={2}
                  placeholder="Programme, instructions..."
                  value={evalDescription}
                  onChange={(e) => setEvalDescription(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-blue-900">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={notifyParents}
                  onChange={(e) => setNotifyParents(e.target.checked)}
                />
                Notifier les parents
              </label>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
              >
                {loading ? 'Création...' : 'Créer'}
              </Button>
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Card title={monthName} className="border-0 shadow-lg" headerActions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)}>
                ← Mois précédent
              </Button>
              <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400" onClick={() => { setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear()); }}>
                Aujourd'hui
              </Button>
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)}>
                Mois suivant →
              </Button>
            </div>
          }>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-blue-900 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => (
                  <div key={i} className={`aspect-square flex items-center justify-center text-xs rounded border ${day ? 'bg-white hover:bg-yellow-50 cursor-pointer border-blue-100' : 'bg-blue-50'}`}>
                    {day && <strong className="text-blue-900">{day}</strong>}
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card title={`Évaluations (${evaluations.length})`} className="border-0 shadow-lg">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {evaluations.length === 0 ? (
                  <p className="text-center text-blue-700/70 text-sm py-6">Aucune évaluation</p>
                ) : (
                  evaluations.map(evaluation => {
                    const classObj = classes.find(c => c.id === evaluation.classId);
                    return (
                      <div key={evaluation.id} className="border border-blue-100 rounded-xl p-3 bg-gradient-to-br from-blue-50 to-white hover:bg-blue-100 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm text-blue-900">{evaluation.name}</h5>
                            <p className="text-xs text-blue-700/80 mt-1">
                              {getTypeLabel(evaluation.type)} • {new Date(evaluation.date).toLocaleDateString('fr-FR')} • Coef: {evaluation.coefficient}
                            </p>
                            {classObj && (
                              <p className="text-xs text-blue-600/70 mt-1">Classe: {classObj.name}</p>
                            )}
                            {evaluation.subject && (
                              <p className="text-xs text-blue-600/70 mt-1">Matière: {evaluation.subject.name}</p>
                            )}
                            {evaluation.description && (
                              <p className="text-xs text-blue-700/70 mt-2">{evaluation.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                              onClick={() => handleEdit(evaluation)}
                            >
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                              onClick={() => handleDeleteEvaluation(evaluation.id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal de modification */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEvaluation(null);
        }}
        title="Modifier l'évaluation"
        size="lg"
      >
        {editingEvaluation && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Nom</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <select
                title="Sélectionner le type"
                className="form-control"
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              >
                <option value="devoir">Devoir</option>
                <option value="examen">Examen</option>
                <option value="interrogation">Interrogation</option>
                <option value="tp">TP/Projet</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Classe</label>
                <select
                  title="Sélectionner la classe"
                  className="form-control"
                  value={String(editForm.classId)}
                  onChange={(e) => setEditForm({ ...editForm, classId: e.target.value ? Number(e.target.value) : '' })}
                >
                  <option value="">Sélectionner (optionnel)</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Matière</label>
                <select
                  title="Sélectionner la matière"
                  className="form-control"
                  value={String(editForm.subjectId)}
                  onChange={(e) => setEditForm({ ...editForm, subjectId: e.target.value ? Number(e.target.value) : '' })}
                >
                  <option value="">Sélectionner (optionnel)</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Coefficient</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={editForm.coefficient}
                  onChange={(e) => setEditForm({ ...editForm, coefficient: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Programme, instructions..."
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={editForm.notifyParents}
                onChange={(e) => setEditForm({ ...editForm, notifyParents: e.target.checked })}
              />
              Notifier les parents
            </label>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEvaluation(null);
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#fbbf24' }}
              >
                {loading ? 'Modification...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </AdminLayout>
  );
};
