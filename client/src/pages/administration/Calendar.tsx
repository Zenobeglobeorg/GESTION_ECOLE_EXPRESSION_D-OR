import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import * as calendarService from '../../services/calendarService';

const getTypeLabel = (type: string) => {
  const labels: { [key: string]: string } = {
    REUNION: 'Réunion',
    EXAMEN: 'Examen',
    ACTIVITE: 'Activité',
    FERIE: 'Jour férié',
    AUTRE: 'Autre',
  };
  return labels[type] || type;
};

const getTypeColor = (type: string) => {
  const colors: { [key: string]: string } = {
    REUNION: 'border-blue-400 bg-blue-50/70 dark:bg-blue-900/30 dark:border-blue-500',
    EXAMEN: 'border-red-400 bg-red-50/70 dark:bg-red-900/30 dark:border-red-500',
    ACTIVITE: 'border-green-400 bg-green-50/70 dark:bg-green-900/30 dark:border-green-500',
    FERIE: 'border-purple-400 bg-purple-50/70 dark:bg-purple-900/30 dark:border-purple-500',
    AUTRE: 'border-gray-400 bg-gray-50/70 dark:bg-gray-800/50 dark:border-gray-500',
  };
  return colors[type] || 'border-yellow-400 bg-yellow-50/70 dark:bg-yellow-900/30 dark:border-yellow-500';
};

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<calendarService.CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<calendarService.CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'REUNION' as calendarService.CalendarEvent['type'],
    location: '',
  });
  const [saving, setSaving] = useState(false);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convertir dimanche (0) en 6 pour que la semaine commence lundi
    return day === 0 ? 6 : day - 1;
  };

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const eventsData = await calendarService.getEvents({ month, year });
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const monthName = new Date(currentDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const handleToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleOpenModal = (event?: calendarService.CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        date: new Date(event.date).toISOString().split('T')[0],
        time: event.time || '',
        type: event.type,
        location: event.location || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        type: 'REUNION',
        location: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      type: 'REUNION',
      location: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (editingEvent) {
        await calendarService.updateEvent(editingEvent.id, formData);
        setSuccess('Événement mis à jour avec succès');
      } else {
        await calendarService.createEvent(formData);
        setSuccess('Événement créé avec succès');
      }

      await loadEvents();
      handleCloseModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet événement ?')) return;

    try {
      await calendarService.deleteEvent(id);
      setSuccess('Événement supprimé avec succès');
      await loadEvents();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Événements à venir (du mois actuel et suivants)
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <AdminLayout
      title="Calendrier scolaire"
      subtitle="Visualisez les événements clés, réunions et examens."
    >
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

      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-400 capitalize">{monthName}</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  onClick={handlePrevMonth}
                >
                  ← Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400"
                  onClick={handleToday}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  onClick={handleNextMonth}
                >
                  Suivant →
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-center font-semibold text-xs text-blue-900 dark:text-blue-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-blue-600 dark:text-blue-400">Chargement...</div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isTodayDate = day ? isToday(day) : false;
                  return (
                    <div
                      key={i}
                      className={`aspect-square flex flex-col items-center justify-start text-xs rounded border p-1 transition-colors ${
                        day
                          ? `bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer border-blue-100 dark:border-gray-700 ${isTodayDate ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}`
                          : 'bg-blue-50 dark:bg-gray-900 border-transparent'
                      }`}
                      onClick={() => day && handleOpenModal()}
                    >
                      {day && (
                        <>
                          <strong className={`text-blue-900 dark:text-blue-300 ${isTodayDate ? 'text-yellow-600 dark:text-yellow-400 font-bold' : ''}`}>
                            {day}
                          </strong>
                          {dayEvents.length > 0 && (
                            <div className="w-full mt-1 space-y-0.5">
                              {dayEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  className={`text-[10px] px-1 py-0.5 rounded truncate ${getTypeColor(event.type)}`}
                                  title={event.title}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(event);
                                  }}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">+{dayEvents.length - 2}</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-400">Événements à venir</h3>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                onClick={() => handleOpenModal()}
              >
                + Ajouter
              </Button>
            </div>
            {loading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">Chargement...</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">Aucun événement à venir</div>
            ) : (
              upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className={`border-l-4 rounded-r-xl p-3 cursor-pointer hover:shadow-sm transition ${getTypeColor(event.type)}`}
                  onClick={() => handleOpenModal(event)}
                >
                  <p className="font-semibold text-sm text-blue-900 dark:text-blue-300">{event.title}</p>
                  <p className="text-xs text-blue-700/80 dark:text-blue-400/80">
                    {new Date(event.date).toLocaleDateString('fr-FR')}
                    {event.time && ` à ${event.time}`}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                      {getTypeLabel(event.type)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(event.id);
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card
            title={editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
            className="w-full max-w-md border-0 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="event-title">
                  Titre *
                </label>
                <input
                  id="event-title"
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="event-type">
                  Type *
                </label>
                <select
                  id="event-type"
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as calendarService.CalendarEvent['type'] })}
                  required
                >
                  <option value="REUNION">Réunion</option>
                  <option value="EXAMEN">Examen</option>
                  <option value="ACTIVITE">Activité</option>
                  <option value="FERIE">Jour férié</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="event-date">
                    Date *
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="event-time">
                    Heure
                  </label>
                  <input
                    id="event-time"
                    type="time"
                    className="form-control"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="event-location">
                  Lieu
                </label>
                <input
                  id="event-location"
                  type="text"
                  className="form-control"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-400" htmlFor="event-description">
                  Description
                </label>
                <textarea
                  id="event-description"
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-linear-to-r from-green-500 via-green-600 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : editingEvent ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};
