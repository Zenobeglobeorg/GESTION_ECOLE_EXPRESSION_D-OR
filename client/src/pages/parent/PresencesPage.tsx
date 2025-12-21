import { useState, useEffect, useMemo } from 'react';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import * as attendanceService from '../../services/attendanceService';

const PresencesPage = () => {
  const { selectedChild } = useSelectedChild();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendances, setAttendances] = useState<attendanceService.Attendance[]>([]);
  const [stats, setStats] = useState<attendanceService.AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
  });
  
  // État pour la navigation entre les mois
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculer les dates de début et de fin du mois
  const monthStart = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return date.toISOString().split('T')[0];
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return date.toISOString().split('T')[0];
  }, [currentDate]);

  // Charger les présences et statistiques
  useEffect(() => {
    console.log('PresencesPage useEffect - selectedChild:', selectedChild);
    
    if (!selectedChild) {
      console.log('PresencesPage: Aucun enfant sélectionné');
      setLoading(false);
      return;
    }

    const loadAttendances = async () => {
      try {
        console.log('PresencesPage: Chargement des présences pour l\'élève:', selectedChild.id);
        console.log('PresencesPage: Période:', monthStart, 'à', monthEnd);
        
        setLoading(true);
        setError(null);

        const [attendancesData, statsData] = await Promise.all([
          attendanceService.getMyChildrenAttendances({
            studentId: selectedChild.id,
            startDate: monthStart,
            endDate: monthEnd,
          }),
          attendanceService.getMyChildrenAttendanceStats({
            studentId: selectedChild.id,
            startDate: monthStart,
            endDate: monthEnd,
          }),
        ]);

        console.log('PresencesPage: Présences reçues:', attendancesData);
        console.log('PresencesPage: Statistiques reçues:', statsData);

        setAttendances(attendancesData);
        setStats(statsData);
      } catch (err) {
        console.error('PresencesPage: Erreur lors du chargement des présences:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des présences';
        console.error('PresencesPage: Message d\'erreur:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadAttendances();
  }, [selectedChild, monthStart, monthEnd]);

  // Formater le mois actuel
  const currentMonthLabel = useMemo(() => {
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Navigation entre les mois
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Fonction helper pour comparer les dates sans tenir compte de l'heure et du fuseau horaire
  const getDateString = (d: Date | string): string => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const y = date.getFullYear();
    const m = date.getMonth();
    const dayNum = date.getDate();
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  };

  // Générer les jours du mois
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Array<{ day: number; date: Date; status?: 'PRESENT' | 'ABSENT' | 'LATE' }> = [];

    // Ajouter les jours vides au début pour aligner avec le premier jour de la semaine
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lundi = 0
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: 0, date: new Date(year, month, -firstDayOfWeek + i + 1) });
    }

    // Ajouter tous les jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = getDateString(date);
      
      // Trouver la présence pour ce jour en comparant les dates locales (sans heure)
      const attendance = attendances.find(att => {
        const attDateStr = getDateString(att.date);
        return attDateStr === dateStr;
      });

      days.push({
        day,
        date,
        status: attendance?.status,
      });
    }

    return days;
  }, [currentDate, attendances]);

  // Obtenir le style pour un jour
  const getDayStatus = (day: number, status?: 'PRESENT' | 'ABSENT' | 'LATE'): string => {
    if (day === 0) return 'bg-transparent border-transparent'; // Jour vide
    
    const today = new Date();
    const isToday = 
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
    
    const isPast = daysInMonth.find(d => d.day === day)?.date && 
      daysInMonth.find(d => d.day === day)!.date < new Date(today.setHours(0, 0, 0, 0));
    
    if (status === 'ABSENT') {
      return `bg-red-100 text-red-800 border-red-200 ${isToday ? 'ring-2 ring-red-400' : ''}`;
    }
    if (status === 'LATE') {
      return `bg-yellow-100 text-yellow-800 border-yellow-200 ${isToday ? 'ring-2 ring-yellow-400' : ''}`;
    }
    if (status === 'PRESENT') {
      return `bg-green-100 text-green-800 border-green-200 ${isToday ? 'ring-2 ring-green-400' : ''}`;
    }
    
    // Pas de présence enregistrée
    if (isPast) {
      return `bg-gray-50 text-gray-400 border-gray-200 ${isToday ? 'ring-2 ring-gray-400' : ''}`;
    }
    
    // Futur
    return `bg-gray-50 text-gray-300 border-gray-200 ${isToday ? 'ring-2 ring-gray-400' : ''}`;
  };

  if (!selectedChild) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-1">
            Suivi des Présences
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Veuillez sélectionner un enfant pour voir ses présences.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-800 dark:text-blue-300 text-sm">
            <p className="font-semibold mb-1">Information</p>
            <p>Pour voir les présences, veuillez sélectionner un enfant depuis le menu déroulant en haut à droite de la page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* En-tête de la page */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-1">
            Suivi des Présences
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Consultez l'assiduité de {selectedChild.firstName} {selectedChild.lastName}.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-blue-700 dark:text-blue-400">
            Chargement des présences...
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            <p className="font-semibold mb-2">Erreur lors du chargement</p>
            <p>{error}</p>
            <button
              onClick={() => {
                if (selectedChild) {
                  setError(null);
                  setLoading(true);
                  // Recharger les données
                  const loadAttendances = async () => {
                    try {
                      const [attendancesData, statsData] = await Promise.all([
                        attendanceService.getMyChildrenAttendances({
                          studentId: selectedChild.id,
                          startDate: monthStart,
                          endDate: monthEnd,
                        }),
                        attendanceService.getMyChildrenAttendanceStats({
                          studentId: selectedChild.id,
                          startDate: monthStart,
                          endDate: monthEnd,
                        }),
                      ]);
                      setAttendances(attendancesData);
                      setStats(statsData);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des présences');
                    } finally {
                      setLoading(false);
                    }
                  };
                  loadAttendances();
                }
              }}
              className="mt-3 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Cartes Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <p className="text-sm text-white text-opacity-90 mb-1">Jours Présent</p>
                <p className="text-3xl font-bold">{stats.present}</p>
              </div>
              <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                <p className="text-sm text-white text-opacity-90 mb-1">Jours Absent</p>
                <p className="text-3xl font-bold">{stats.absent}</p>
              </div>
              <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
                <p className="text-sm text-white text-opacity-90 mb-1">Retards</p>
                <p className="text-3xl font-bold">{stats.late}</p>
              </div>
            </div>

            {/* Message si aucune présence */}
            {attendances.length === 0 && !loading && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-300">
                <p className="font-semibold mb-1">Aucune présence enregistrée</p>
                <p className="text-sm">
                  Aucune donnée de présence n'a été trouvée pour {selectedChild.firstName} {selectedChild.lastName} 
                  pour la période du {new Date(monthStart).toLocaleDateString('fr-FR')} au {new Date(monthEnd).toLocaleDateString('fr-FR')}.
                </p>
              </div>
            )}

            {/* Vue Calendrier */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 capitalize">
                  {currentMonthLabel}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={handleCurrentMonth}
                    className="px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Jours de la semaine */}
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grille du calendrier */}
                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map((dayInfo, index) => (
                    <div
                      key={index}
                      className={`w-full h-16 p-2 rounded-lg border text-sm font-semibold flex flex-col items-center justify-center ${getDayStatus(dayInfo.day, dayInfo.status)}`}
                    >
                      {dayInfo.day > 0 && (
                        <>
                          <span>{dayInfo.day}</span>
                          {dayInfo.status && (
                            <span className="text-xs mt-1">
                              {dayInfo.status === 'PRESENT' ? '✓' : 
                               dayInfo.status === 'ABSENT' ? '✗' : 
                               dayInfo.status === 'LATE' ? '⏰' : ''}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Présent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">En retard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Non enregistré</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
};

export default PresencesPage;
