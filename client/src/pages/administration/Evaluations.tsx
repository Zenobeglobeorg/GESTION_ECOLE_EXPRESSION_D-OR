import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Evaluation {
  id: number;
  name: string;
  type: string;
  classId: number;
  date: string;
  coefficient: number;
  description?: string;
  notifyParents?: boolean;
}

interface SchoolClass {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

export const Evaluations = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Form state
  const [evalName, setEvalName] = useState('');
  const [evalType, setEvalType] = useState('devoir');
  const [evalClass, setEvalClass] = useState('');
  const [evalSubject, setEvalSubject] = useState('');
  const [evalDate, setEvalDate] = useState('');
  const [evalCoefficient, setEvalCoefficient] = useState(1);
  const [evalDescription, setEvalDescription] = useState('');
  const [notifyParents, setNotifyParents] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const [c, s, e] = await Promise.all([
          fetch(`${API_BASE_URL}/api/classes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
          fetch(`${API_BASE_URL}/api/subjects`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
          fetch(`${API_BASE_URL}/api/evaluations`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
        ]);
        setClasses(c || []);
        setSubjects(s || []);
        setEvaluations(e || [
          { id: 1, name: 'Devoir 1', type: 'devoir', classId: 1, date: '2023-10-10', coefficient: 1 },
          { id: 2, name: 'Examen', type: 'examen', classId: 1, date: '2023-10-20', coefficient: 2 },
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    load();
  }, []);

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: evalName,
          type: evalType,
          classId: Number(evalClass),
          subjectId: Number(evalSubject),
          date: evalDate,
          coefficient: Number(evalCoefficient),
          description: evalDescription,
          notifyParents,
        }),
      });
      if (!res.ok) throw new Error('Erreur création');
      const newEval = await res.json();
      setEvaluations([...evaluations, newEval]);
      alert('Évaluation créée');
      setEvalName('');
      setEvalType('devoir');
      setEvalClass('');
      setEvalSubject('');
      setEvalDate('');
      setEvalCoefficient(1);
      setEvalDescription('');
      setNotifyParents(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteEvaluation = async (id: number) => {
    if (!confirm('Supprimer cette évaluation ?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/evaluations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur suppression');
      setEvaluations(evaluations.filter(e => e.id !== id));
      alert('Évaluation supprimée');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = new Date(currentYear, currentMonth).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  return (
    <AdminLayout
      title="Planification des Évaluations"
      subtitle="Créer et gérer les évaluations et examens"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card title="Créer une évaluation" className="border-0 shadow-lg">
            <form onSubmit={handleCreateEvaluation} className="p-4 space-y-3">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="eval-name">Nom</label>
                <input className="form-control" id="eval-name" placeholder="Devoir surveillé n°1" value={evalName} onChange={(e) => setEvalName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="eval-type">Type</label>
                <select className="form-control" id="eval-type" value={evalType} onChange={(e) => setEvalType(e.target.value)}>
                  <option value="devoir">Devoir</option>
                  <option value="examen">Examen</option>
                  <option value="interrogation">Interrogation</option>
                  <option value="tp">TP/Projet</option>
                </select>
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="eval-class">Classe</label>
                <select className="form-control" id="eval-class" value={evalClass} onChange={(e) => setEvalClass(e.target.value)} required>
                  <option value="">Sélectionner</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="eval-subject">Matière</label>
                <select className="form-control" id="eval-subject" value={evalSubject} onChange={(e) => setEvalSubject(e.target.value)}>
                  <option value="">Sélectionner</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="eval-date">Date</label>
                <input type="date" className="form-control" id="eval-date" value={evalDate} onChange={(e) => setEvalDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="eval-coef">Coefficient</label>
                <input type="number" className="form-control" id="eval-coef" min="1" max="10" value={evalCoefficient} onChange={(e) => setEvalCoefficient(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900" htmlFor="eval-desc">Description</label>
                <textarea className="form-control" id="eval-desc" rows={2} placeholder="Programme, instructions..." value={evalDescription} onChange={(e) => setEvalDescription(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm text-blue-900">
                <input type="checkbox" className="w-4 h-4" checked={notifyParents} onChange={(e) => setNotifyParents(e.target.checked)} />
                Notifier les parents
              </label>
              <Button type="submit" className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                Créer
              </Button>
            </form>
          </Card>
          <Card title="Configuration des trimestres" className="border-0 shadow-lg">
            <div className="p-4 space-y-3 text-sm">
              {[1, 2, 3].map(t => (
                <div key={t} className="border border-blue-100 rounded-xl p-3 bg-blue-50/60">
                  <h5 className="font-semibold text-blue-900">Trimestre {t}</h5>
                  <p className="text-xs text-blue-700/70">15 sept - 15 déc</p>
                  <Button size="sm" variant="outline" className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400" onClick={() => alert('Générer les bulletins')}>
                    Générer bulletins
                  </Button>
                </div>
              ))}
            </div>
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
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {evaluations.map(evaluation => (
                <div key={evaluation.id} className="border border-blue-100 rounded-xl p-3 bg-blue-50 hover:bg-blue-100 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold text-sm text-blue-900">{evaluation.name}</h5>
                      <p className="text-xs text-blue-700/80">{evaluation.type} • {evaluation.date} • Coef: {evaluation.coefficient}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-2 py-1" onClick={() => handleDeleteEvaluation(evaluation.id)}>
                      Supprimer
                    </Button>
                  </div>
                  {evaluation.description && <p className="text-xs text-blue-700/70 mt-2">{evaluation.description}</p>}
                </div>
              ))}
              {evaluations.length === 0 && <p className="text-center text-blue-700/70 text-sm">Aucune évaluation</p>}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
