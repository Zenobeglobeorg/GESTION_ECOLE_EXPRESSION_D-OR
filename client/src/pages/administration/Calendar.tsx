import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
}

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
  const [events] = useState<Event[]>([
    { id: 1, title: 'Conseil de classe', date: '2025-01-06', time: '15:00', type: 'Réunion' },
    { id: 2, title: 'Début examens', date: '2025-01-13', time: '08:00', type: 'Examen' },
  ]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthName = new Date(currentDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <AdminLayout
      title="Calendrier scolaire"
      subtitle="Visualisez les événements clés, réunions et examens."
    >
      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-blue-900 capitalize">{monthName}</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={handlePrevMonth}>
                  ← Précédent
                </Button>
                <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400" onClick={handleToday}>
                  Aujourd'hui
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={handleNextMonth}>
                  Suivant →
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-center font-semibold text-xs text-blue-900 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => (
                <div key={i} className={`aspect-square flex items-center justify-center text-xs rounded border ${
                  day ? 'bg-white hover:bg-yellow-50 cursor-pointer border-blue-100' : 'bg-blue-50 border-transparent'
                }`}>
                  {day && <strong className="text-blue-900">{day}</strong>}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-lg text-blue-900">Événements à venir</h3>
            {events.map(event => (
              <div key={event.id} className="border-l-4 border-yellow-400 bg-yellow-50/70 rounded-r-xl p-3">
                <p className="font-semibold text-sm text-blue-900">{event.title}</p>
                <p className="text-xs text-blue-700/80">{event.date} à {event.time}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{event.type}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400" onClick={() => alert('Ajouter un événement')}>
              Ajouter un événement
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
