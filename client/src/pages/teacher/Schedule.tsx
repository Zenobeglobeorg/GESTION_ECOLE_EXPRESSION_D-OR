import { useState, useEffect, useCallback } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card } from '../../components/ui/Card';
import * as classService from '../../services/classService';
import * as scheduleService from '../../services/scheduleService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

interface ClassSubject {
  id: number;
  name: string;
  classId: number;
  teacherId?: number | null;
  subject?: {
    id: number;
    name: string;
  };
}

interface ScheduleWithTeacher extends scheduleService.Schedule {
  teacherId?: number | null;
}

interface CourseInfo {
  subject: string;
  class: string;
  room?: string;
  isEvent?: boolean; // Pour différencier les événements des matières
}

export const Schedule = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [classes, setClasses] = useState<classService.Class[]>([]);
  const [subjects, setSubjects] = useState<ClassSubject[]>([]);
  const [allSchedules, setAllSchedules] = useState<ScheduleWithTeacher[]>([]);
  const [classTimeSlots, setClassTimeSlots] = useState<Record<number, scheduleService.TimeSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      // Charger les classes de l'enseignant
      const classesData = await classService.getMyClasses();
      setClasses(classesData);

      // Charger les emplois du temps et les créneaux horaires pour toutes les classes de l'enseignant
      const schedulesPromises = classesData.map((cls) =>
        scheduleService.getSchedules(cls.id).catch(() => [])
      );
      const timeSlotsPromises = classesData.map(async (cls) => {
        try {
          const { timeSlots } = await scheduleService.getClassTimeSlots(cls.id);
          return { classId: cls.id, timeSlots: timeSlots || [] };
        } catch {
          return { classId: cls.id, timeSlots: [] };
        }
      });
      
      const [schedulesArrays, timeSlotsResults] = await Promise.all([
        Promise.all(schedulesPromises),
        Promise.all(timeSlotsPromises),
      ]);
      
      const allSchedulesData = schedulesArrays.flat();
      
      // Stocker les créneaux horaires par classe
      const timeSlotsMap: Record<number, scheduleService.TimeSlot[]> = {};
      timeSlotsResults.forEach(({ classId, timeSlots }) => {
        if (timeSlots.length > 0) {
          timeSlotsMap[classId] = timeSlots;
        }
      });
      setClassTimeSlots(timeSlotsMap);

      console.log('All schedules data:', allSchedulesData);
      console.log('User ID:', user?.id);
      
      // Debug: vérifier quelques schedules pour voir leur structure
      if (allSchedulesData.length > 0) {
        console.log('First schedule sample:', allSchedulesData[0]);
        console.log('Schedules with type SUBJECT:', allSchedulesData.filter((s: any) => s.type === 'SUBJECT').slice(0, 3));
      }

      // Les schedules sont déjà enrichis avec teacherId côté backend pour les enseignants
      // Filtrer pour ne garder que les créneaux pertinents pour l'enseignant
      const teacherSchedules = allSchedulesData.filter(
        (schedule: any) => {
          // Pour les matières (SUBJECT), vérifier que l'enseignant est assigné
          if (schedule.type === 'SUBJECT') {
            const hasTeacherId = schedule.teacherId !== null && schedule.teacherId !== undefined;
            const teacherMatches = schedule.teacherId === user?.id;
            const hasSubjectId = !!schedule.subjectId;
            const matches = teacherMatches && hasSubjectId;
            
            if (hasTeacherId) {
              console.log(`Schedule check: ${schedule.subject?.name || 'Unknown'} - teacherId=${schedule.teacherId}, user.id=${user?.id}, matches=${teacherMatches}, hasSubjectId=${hasSubjectId}, final=${matches}`);
            } else {
              console.log(`Schedule has no teacherId: ${schedule.subject?.name || 'Unknown'} - type=${schedule.type}, subjectId=${schedule.subjectId}`);
            }
            
            return matches;
          }
          
          // Pour les événements (EVENT), les afficher car ils font partie de l'emploi du temps
          // L'enseignant doit voir tous les événements de ses classes (pauses, prière, etc.)
          if (schedule.type === 'EVENT') {
            // Vérifier que l'événement appartient à une classe de l'enseignant
            const isInTeacherClass = classesData.some(cls => cls.id === schedule.classId);
            if (isInTeacherClass) {
              console.log(`Event included: ${schedule.eventName} in class ${schedule.class?.name}`);
            }
            return isInTeacherClass;
          }
          
          return false;
        }
      );

      setAllSchedules(teacherSchedules);
      
      // Debug: afficher les données chargées
      console.log('Teacher schedules loaded:', teacherSchedules);
      console.log('Class time slots loaded:', timeSlotsMap);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Construire la structure de données pour l'affichage
  const buildScheduleMap = (): Record<string, Record<string, CourseInfo | null>> => {
    const scheduleMap: Record<string, Record<string, CourseInfo | null>> = {};

    console.log('Building schedule map from schedules:', allSchedules);

    allSchedules.forEach((schedule) => {
      const dayName = numberToDay[schedule.dayOfWeek];
      if (!dayName) {
        console.warn('Unknown day number:', schedule.dayOfWeek);
        return;
      }

      const startTime = schedule.startTime;
      if (!scheduleMap[startTime]) {
        scheduleMap[startTime] = {};
      }

      // Gérer les événements différemment des matières
      if (schedule.type === 'EVENT') {
        scheduleMap[startTime][dayName] = {
          subject: schedule.eventName || 'Événement',
          class: schedule.class?.name || 'Classe inconnue',
          room: undefined,
          isEvent: true, // Marquer comme événement pour l'affichage
        };
      } else {
        scheduleMap[startTime][dayName] = {
          subject: schedule.subject?.name || 'Sans matière',
          class: schedule.class?.name || 'Classe inconnue',
          room: undefined, // Les salles ne sont pas stockées dans le modèle actuel
        };
      }
    });

    console.log('Schedule map built:', scheduleMap);
    return scheduleMap;
  };

  const scheduleMap = buildScheduleMap();

  // Générer les créneaux horaires à partir des créneaux horaires personnalisés des classes ou des schedules
  const generateTimeSlots = (): Array<{ start: string; end: string; label: string }> => {
    // Récupérer tous les créneaux horaires uniques de toutes les classes
    const allTimeSlots = new Map<string, { start: string; end: string }>();
    
    // D'abord, utiliser les créneaux horaires personnalisés sauvegardés
    Object.values(classTimeSlots).forEach((slots) => {
      slots.forEach((slot) => {
        const key = slot.startTime;
        if (!allTimeSlots.has(key) || allTimeSlots.get(key)!.endTime < slot.endTime) {
          allTimeSlots.set(key, { start: slot.startTime, end: slot.endTime });
        }
      });
    });
    
    // Ensuite, ajouter les créneaux des schedules si pas déjà présents
    allSchedules.forEach((schedule) => {
      const key = schedule.startTime;
      if (!allTimeSlots.has(key)) {
        allTimeSlots.set(key, { start: schedule.startTime, end: schedule.endTime });
      }
    });

    // Trier les heures par heure de début
    const sortedSlots = Array.from(allTimeSlots.values()).sort((a, b) => 
      a.start.localeCompare(b.start)
    );

    return sortedSlots.map((slot) => ({
      start: slot.start,
      end: slot.end,
      label: `${slot.start} - ${slot.end}`,
    }));
  };

  const timeSlots = generateTimeSlots();

  // Obtenir les cours d'aujourd'hui
  const getTodaySchedule = () => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    // Convertir en index pour notre tableau (Lundi = 1)
    const dayNumber = dayIndex === 0 ? 7 : dayIndex; // Dimanche devient 7
    const adjustedDayNumber = dayNumber === 7 ? 0 : dayNumber; // Si c'est dimanche, on ne montre rien
    const dayName = numberToDay[adjustedDayNumber] || null;

    if (!dayName) return [];

    return timeSlots
      .map((slot) => ({
        ...slot,
        course: scheduleMap[slot.start]?.[dayName] || null,
      }))
      .filter((item) => item.course !== null)
      .sort((a, b) => a.start.localeCompare(b.start));
  };

  const todaySchedule = getTodaySchedule();

  // Calculer les statistiques
  const calculateStats = () => {
    // Heures par semaine : calculer le total des heures
    let totalHours = 0;
    allSchedules.forEach((schedule) => {
      const start = schedule.startTime.split(':').map(Number);
      const end = schedule.endTime.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      const durationHours = (endMinutes - startMinutes) / 60;
      totalHours += durationHours;
    });

    // Cours aujourd'hui
    const todayCount = todaySchedule.length;

    // Nombre de classes uniques
    const uniqueClasses = new Set(allSchedules.map((s) => s.classId));
    const classesCount = uniqueClasses.size;

    return {
      weeklyHours: Math.round(totalHours * 10) / 10, // Arrondir à 1 décimale
      todayCourses: todayCount,
      classesCount,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <TeacherLayout
        title={t('teacher.schedule') || 'Emploi du Temps'}
        subtitle={t('teacher.viewWeeklySchedule') || 'Consulter votre planning hebdomadaire'}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-600 dark:text-blue-400">{t('common.loading') || 'Chargement...'}</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout
        title={t('teacher.schedule') || 'Emploi du Temps'}
        subtitle={t('teacher.viewWeeklySchedule') || 'Consulter votre planning hebdomadaire'}
      >
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title={t('teacher.schedule') || 'Emploi du Temps'}
      subtitle={t('teacher.viewWeeklySchedule') || 'Consulter votre planning hebdomadaire'}
    >
      <div className="space-y-4 md:space-y-6">
        {/* Planning d'aujourd'hui */}
        <Card className="border-0 shadow-lg dark:bg-gray-800">
          <div className="bg-linear-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 px-4 md:px-6 py-3 md:py-4 rounded-t-lg">
            <h3 className="text-blue-900 dark:text-blue-900 font-bold text-base md:text-lg">
              {t('teacher.today') || "Aujourd'hui"}
            </h3>
          </div>
          <div className="p-4 md:p-6">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-blue-600 dark:text-blue-400 text-sm md:text-base">
                  {t('teacher.noCoursesToday') || 'Aucun cours prévu aujourd\'hui'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {todaySchedule.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 md:p-4 bg-linear-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-lg border-2 border-blue-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-gray-500 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">
                          {item.label}
                        </p>
                        <p className="font-semibold text-blue-900 dark:text-white text-base md:text-lg truncate">
                          {item.course?.subject}
                        </p>
                        <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                          {item.course?.class}
                        </p>
                        {item.course?.room && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            📍 {item.course.room}
                          </p>
                        )}
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 flex items-center justify-center text-blue-900 dark:text-blue-900 font-bold text-xs md:text-sm shadow-md flex-shrink-0">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Emploi du temps hebdomadaire - Vue Desktop */}
        {timeSlots.length > 0 && (
          <Card className="hidden lg:block border-0 shadow-lg dark:bg-gray-800">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4 rounded-t-lg">
              <h3 className="text-white font-bold text-lg">
                {t('teacher.weeklySchedule') || 'Planning Hebdomadaire'}
              </h3>
            </div>
            <div className="p-6 overflow-x-auto">
              <div className="min-w-full">
                {/* En-tête avec les jours */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="p-3"></div>
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className={`p-3 text-center font-semibold rounded-lg transition-all cursor-pointer text-sm ${
                        selectedDay === day
                          ? 'bg-linear-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 text-blue-900 dark:text-blue-900 shadow-md'
                          : 'bg-linear-to-r from-blue-100 to-blue-50 dark:from-gray-700 dark:to-gray-600 text-blue-900 dark:text-white hover:from-blue-200 hover:to-blue-100 dark:hover:from-gray-600 dark:hover:to-gray-500'
                      }`}
                      title={t('teacher.selectDay') || 'Sélectionner le jour'}
                      onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Corps du tableau avec les horaires */}
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <div key={slot.start} className="grid grid-cols-6 gap-2">
                      <div className="p-3 bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-semibold text-sm rounded-lg flex items-center justify-center shadow-md">
                        {slot.label}
                      </div>
                      {daysOfWeek.map((day) => {
                        const course = scheduleMap[slot.start]?.[day];
                        const isSelected = selectedDay === day && selectedTime === slot.start;
                        return (
                          <div
                            key={`${slot.start}-${day}`}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer min-h-[80px] ${
                              course
                                ? isSelected
                                  ? 'bg-linear-to-br from-yellow-200 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 border-yellow-400 dark:border-yellow-500 shadow-lg'
                                  : 'bg-linear-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-600 border-blue-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-gray-500 hover:shadow-md'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                            onClick={() => {
                              setSelectedDay(day);
                              setSelectedTime(slot.start);
                            }}
                          >
                            {course ? (
                              <div>
                                {course.isEvent ? (
                                  <>
                                    <p className="font-semibold text-purple-900 dark:text-purple-200 text-sm mb-1 flex items-center gap-1">
                                      <span>📅</span>
                                      {course.subject}
                                    </p>
                                    <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">
                                      {course.class}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-semibold text-blue-900 dark:text-white text-sm mb-1">
                                      {course.subject}
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                                      {course.class}
                                    </p>
                                  </>
                                )}
                                {course.room && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    📍 {course.room}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Emploi du temps hebdomadaire - Vue Mobile/Tablette */}
        {timeSlots.length > 0 && (
          <div className="lg:hidden space-y-4">
            {daysOfWeek.map((day) => {
              const dayCourses = timeSlots
                .map((slot) => ({
                  ...slot,
                  course: scheduleMap[slot.start]?.[day] || null,
                }))
                .filter((item) => item.course !== null)
                .sort((a, b) => a.start.localeCompare(b.start));

              if (dayCourses.length === 0) return null;

              return (
                <Card key={day} className="border-0 shadow-lg dark:bg-gray-800">
                  <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-4 py-3 rounded-t-lg">
                    <h3 className="text-white font-bold text-base">{day}</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {dayCourses.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-linear-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-lg border-2 border-blue-200 dark:border-gray-600"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">
                              {item.label}
                            </p>
                            <p className="font-semibold text-blue-900 dark:text-white text-sm md:text-base truncate">
                              {item.course?.subject}
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              {item.course?.class}
                            </p>
                            {item.course?.room && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                📍 {item.course.room}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {timeSlots.length === 0 && (
          <Card className="border-0 shadow-lg dark:bg-gray-800">
            <div className="p-6 text-center">
              <p className="text-blue-600 dark:text-blue-400">
                {t('teacher.noScheduleAvailable') || "Aucun emploi du temps disponible. L'administrateur doit d'abord générer l'emploi du temps."}
              </p>
            </div>
          </Card>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-linear-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-sm md:text-lg font-semibold">
                  {t('teacher.weeklyHours') || 'Heures par semaine'}
                </h3>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{stats.weeklyHours}h</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-linear-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 text-blue-900 dark:text-blue-900">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-sm md:text-lg font-semibold">
                  {t('teacher.todayCourses') || 'Cours aujourd\'hui'}
                </h3>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-900/20 dark:bg-blue-800/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{stats.todayCourses}</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white sm:col-span-2 lg:col-span-1">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-sm md:text-lg font-semibold">
                  {t('teacher.classes') || 'Classes'}
                </h3>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{stats.classesCount}</p>
            </div>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
};
