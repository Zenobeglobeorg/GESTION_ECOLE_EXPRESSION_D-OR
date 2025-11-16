import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import * as userService from '../../services/userService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SchoolClass {
  id: number;
  name: string;
}

const timeSlots = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00',
  '11:00-12:00', '12:00-13:00', '13:00-14:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00'
];
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export const Timetable = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<userService.UserWithDate[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [currentWeek, setCurrentWeek] = useState({ week: 42, dates: '16-20 Octobre 2023' });

  // Replacement form
  const [absentTeacher, setAbsentTeacher] = useState<number | ''>('');
  const [replacementTeacher, setReplacementTeacher] = useState<number | ''>('');
  const [repStartDate, setRepStartDate] = useState('');
  const [repEndDate, setRepEndDate] = useState('');
  const [repReason, setRepReason] = useState('maladie');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const [classesRes, users] = await Promise.all([
          fetch(`${API_BASE_URL}/api/classes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
          userService.getUsers(),
        ]);
        setClasses(classesRes || []);
        setTeachers(users.filter(u => u.role === 'TEACHER'));
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    load();
  }, []);

  const handleCreateReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      const res = await fetch(`${API_BASE_URL}/api/replacements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ absentTeacherId: absentTeacher, replacementTeacherId: replacementTeacher, startDate: repStartDate, endDate: repEndDate, reason: repReason }),
      });
      if (!res.ok) throw new Error('Erreur création remplacement');
      alert('Remplacement programmé');
      setAbsentTeacher(''); setReplacementTeacher(''); setRepStartDate(''); setRepEndDate('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handlePublish = () => {
    if (confirm('Êtes-vous sûr de vouloir publier cet emploi du temps ?')) {
      alert('Emploi du temps publié');
    }
  };

  const handlePrintTimetable = () => {
    window.print();
  };

  return (
    <AdminLayout
      title="Générer l'emploi du temps"
      subtitle="Créer et gérer les horaires des classes."
    >
      <Card title="Générateur d'emploi du temps" className="mb-8 border-0 shadow-lg">
        <form onSubmit={(e) => { e.preventDefault(); alert('Emploi du temps généré'); }} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="timetable-class">Classe</label>
              <select className="form-control" id="timetable-class" value={String(selectedClass)} onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : '')} required>
                <option value="">Sélectionner une classe</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="timetable-week">Semaine</label>
              <select className="form-control" id="timetable-week" value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))} required>
                {[1, 2, 3, 4].map(w => <option key={w} value={w}>Semaine {w}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-blue-900">Jours de la semaine</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
              {days.map(day => (
                <label key={day} className="flex items-center gap-2 px-3 py-2 border border-blue-100 rounded-lg bg-blue-50/60">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-blue-900">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="start-time">Heure de début</label>
              <input type="time" id="start-time" className="form-control" defaultValue="08:00" required />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="end-time">Heure de fin</label>
              <input type="time" id="end-time" className="form-control" defaultValue="17:00" required />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
              Générer l'emploi du temps
            </Button>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => alert('Aperçu de l\'emploi du temps')}>
              Aperçu
            </Button>
          </div>
        </form>
      </Card>

      <Card title={`Emploi du temps - ${classes.find(c => c.id === selectedClass)?.name || 'Classe'}`} className="mb-8 border-0 shadow-lg">
        <div className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => setCurrentWeek({ week: currentWeek.week - 1, dates: 'Semaine précédente' })}>
              ← Semaine précédente
            </Button>
            <span className="font-semibold text-blue-900">Semaine {currentWeek.week} ({currentWeek.dates})</span>
            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => setCurrentWeek({ week: currentWeek.week + 1, dates: 'Semaine suivante' })}>
              Semaine suivante →
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="border border-blue-600 p-2 text-left">Heure</th>
                  {days.map(day => <th key={day} className="border border-blue-600 p-2 text-center">{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot}>
                    <td className="border border-blue-100 p-2 bg-blue-50 font-semibold text-blue-900 w-24">{slot}</td>
                    {days.map(day => (
                      <td key={`${day}-${slot}`} className="border border-blue-100 p-2 h-16 hover:bg-yellow-50 cursor-pointer">
                        <div className="text-sm text-blue-900">
                          <div className="font-semibold">Mathématiques</div>
                          <div className="text-xs text-blue-700/70">M. Dupont</div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => alert('Mode édition activé')}>
              Modifier
            </Button>
            <Button className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500" onClick={handlePublish}>
              Publier
            </Button>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={handlePrintTimetable}>
              Imprimer
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Gestion des remplacements" className="border-0 shadow-lg">
        <form onSubmit={handleCreateReplacement} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="absent-teacher">Enseignant absent</label>
              <select className="form-control" id="absent-teacher" value={String(absentTeacher)} onChange={(e) => setAbsentTeacher(e.target.value ? Number(e.target.value) : '')} required>
                <option value="">Sélectionner un enseignant</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="replacement-teacher">Enseignant remplaçant</label>
              <select className="form-control" id="replacement-teacher" value={String(replacementTeacher)} onChange={(e) => setReplacementTeacher(e.target.value ? Number(e.target.value) : '')} required>
                <option value="">Sélectionner un remplaçant</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="replacement-start">Date de début</label>
              <input type="date" id="replacement-start" className="form-control" value={repStartDate} onChange={(e) => setRepStartDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-blue-900" htmlFor="replacement-end">Date de fin</label>
              <input type="date" id="replacement-end" className="form-control" value={repEndDate} onChange={(e) => setRepEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="text-sm font-medium text-blue-900" htmlFor="replacement-reason">Motif de l&apos;absence</label>
            <select className="form-control" id="replacement-reason" value={repReason} onChange={(e) => setRepReason(e.target.value)} required>
              <option value="maladie">Maladie</option>
              <option value="formation">Formation</option>
              <option value="conges">Congés</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <Button type="submit" className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
            Programmer le remplacement
          </Button>
        </form>
      </Card>
    </AdminLayout>
  );
};
