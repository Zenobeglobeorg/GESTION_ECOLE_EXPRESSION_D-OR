import React, { useState, useEffect, useMemo } from 'react';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import * as scheduleService from '../../services/scheduleService';
import * as userService from '../../services/userService';

// Mapping des jours
const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const dayToNumber: Record<string, number> = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
};

const numberToDay: Record<number, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
};

type CourseSlot = {
  subject: string;
  teacher: string;
  eventName?: string;
  type: 'SUBJECT' | 'EVENT';
} | null;

type WeekSchedule = {
  Lundi: CourseSlot[];
  Mardi: CourseSlot[];
  Mercredi: CourseSlot[];
  Jeudi: CourseSlot[];
  Vendredi: CourseSlot[];
};

const EmploiDuTempsPage: React.FC = () => {
  const { selectedChild } = useSelectedChild();
  const [schedules, setSchedules] = useState<scheduleService.Schedule[]>([]);
  const [timeSlots, setTimeSlots] = useState<scheduleService.TimeSlot[]>([]);
  const [teachers, setTeachers] = useState<Record<number, userService.UserWithDate>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données de l'emploi du temps
  useEffect(() => {
    const loadScheduleData = async () => {
      if (!selectedChild || !selectedChild.classId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Charger les schedules et les créneaux horaires de la classe
        const [schedulesData, { timeSlots: savedTimeSlots }] = await Promise.all([
          scheduleService.getSchedules(selectedChild.classId),
          scheduleService.getClassTimeSlots(selectedChild.classId).catch(() => ({ timeSlots: null })),
        ]);

        setSchedules(schedulesData);

        // Utiliser les créneaux horaires sauvegardés ou générer à partir des schedules
        if (savedTimeSlots && savedTimeSlots.length > 0) {
          setTimeSlots(savedTimeSlots);
        } else {
          // Générer les créneaux horaires à partir des schedules
          const timeSet = new Set<string>();
          schedulesData.forEach((schedule) => {
            timeSet.add(schedule.startTime);
          });
          const sortedTimes = Array.from(timeSet).sort();
          const generatedSlots: scheduleService.TimeSlot[] = sortedTimes.map((startTime, index) => {
            const schedule = schedulesData.find((s) => s.startTime === startTime);
            return {
              id: `slot-${index}`,
              startTime,
              endTime: schedule?.endTime || startTime,
            };
          });
          setTimeSlots(generatedSlots);
        }

        // Charger les informations des enseignants si nécessaire
        // (Pour l'instant, on utilise les données du schedule qui incluent déjà le nom du professeur via subject)
      } catch (err) {
        console.error('Error loading schedule data:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'emploi du temps');
      } finally {
        setLoading(false);
      }
    };

    loadScheduleData();
  }, [selectedChild]);

  // Construire la structure de données pour l'affichage
  const buildScheduleMap = useMemo((): WeekSchedule => {
    const scheduleMap: WeekSchedule = {
      Lundi: [],
      Mardi: [],
      Mercredi: [],
      Jeudi: [],
      Vendredi: [],
    };

    // Initialiser toutes les cases avec null
    timeSlots.forEach(() => {
      scheduleMap.Lundi.push(null);
      scheduleMap.Mardi.push(null);
      scheduleMap.Mercredi.push(null);
      scheduleMap.Jeudi.push(null);
      scheduleMap.Vendredi.push(null);
    });

    // Remplir avec les schedules
    schedules.forEach((schedule) => {
      const dayName = numberToDay[schedule.dayOfWeek] as keyof WeekSchedule;
      if (!dayName) return;

      const timeSlotIndex = timeSlots.findIndex((slot) => slot.startTime === schedule.startTime);
      if (timeSlotIndex === -1) return;

      if (schedule.type === 'EVENT') {
        scheduleMap[dayName][timeSlotIndex] = {
          subject: '',
          teacher: '',
          eventName: schedule.eventName || 'Événement',
          type: 'EVENT',
        };
      } else {
        scheduleMap[dayName][timeSlotIndex] = {
          subject: schedule.subject?.name || 'Sans matière',
          teacher: '', // Le nom du professeur n'est pas directement disponible dans le schedule
          type: 'SUBJECT',
        };
      }
    });

    return scheduleMap;
  }, [schedules, timeSlots]);

  const currentSchedule = buildScheduleMap;

  const handlePrint = () => {
    window.print();
  };

  // Formater les créneaux horaires pour l'affichage
  const formattedTimeSlots = timeSlots.map((slot) => `${slot.startTime}-${slot.endTime}`);

  if (!selectedChild) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors p-6">
        <div className="text-center py-8">
          <p className="text-blue-600 dark:text-blue-400">
            Veuillez sélectionner un enfant pour voir son emploi du temps.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 dark:text-blue-400">Chargement de l'emploi du temps...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors p-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
      {/* EN-TÊTE */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        {/* Titre et Bouton Imprimer */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">
              Emploi du Temps
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedChild.firstName} {selectedChild.lastName}
              {selectedChild.class?.name && ` - ${selectedChild.class.name}`}
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="mt-2 sm:mt-0 px-5 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Imprimer l'emploi du temps
          </button>
        </div>
      </div>

      {/* Conteneur de la Grille (permet le défilement horizontal sur mobile) */}
      <div className="p-6 overflow-x-auto">
        {timeSlots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-blue-600 dark:text-blue-400">
              Aucun emploi du temps disponible. L'administrateur doit d'abord générer l'emploi du temps pour cette classe.
            </p>
          </div>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
            {/* En-tête du tableau (Bleu) */}
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-sm font-semibold text-left border border-blue-700">Heure</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="p-3 text-sm font-semibold text-left border border-blue-700 min-w-[150px]">{day}</th>
                ))}
              </tr>
            </thead>
            
            {/* Corps du tableau */}
            <tbody>
              {formattedTimeSlots.map((time, timeIndex) => (
                <tr 
                  key={time} 
                  className="bg-white dark:bg-gray-800 even:bg-gray-50 dark:even:bg-gray-700/50 transition-colors"
                >
                  {/* Cellule de l'heure */}
                  <td className="p-3 text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                    {time}
                  </td>
                  
                  {/* Cellules des cours */}
                  {daysOfWeek.map(day => {
                    const course = currentSchedule[day as keyof WeekSchedule][timeIndex];
                    return (
                      <td key={day} className="p-3 text-sm border border-gray-300 dark:border-gray-600 align-top">
                        {course ? (
                          // Contenu de la case
                          <div>
                            {course.type === 'EVENT' ? (
                              <>
                                <p className="font-semibold text-purple-800 dark:text-purple-400">
                                  📅 {course.eventName}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-semibold text-blue-800 dark:text-blue-400">{course.subject}</p>
                                {course.teacher && (
                                  <p className="text-gray-600 dark:text-gray-400 text-xs">{course.teacher}</p>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          // Case vide
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default EmploiDuTempsPage;