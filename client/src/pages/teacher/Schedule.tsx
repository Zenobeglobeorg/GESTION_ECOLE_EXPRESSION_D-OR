import { useState } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card } from '../../components/ui/Card';

// Données fictives pour l'emploi du temps
const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const timeSlots = [
  { start: '07:30', end: '09:00', label: '07:30 - 09:00' },
  { start: '09:15', end: '10:45', label: '09:15 - 10:45' },
  { start: '11:00', end: '12:30', label: '11:00 - 12:30' },
  { start: '14:00', end: '15:30', label: '14:00 - 15:30' },
  { start: '15:45', end: '17:15', label: '15:45 - 17:15' },
];

const mockSchedule: Record<string, Record<string, { subject: string; class: string; room?: string } | null>> = {
  '07:30': {
    'Lundi': { subject: 'Mathématiques', class: 'CM1 A', room: 'Salle 101' },
    'Mardi': null,
    'Mercredi': { subject: 'Français', class: 'CM2 B', room: 'Salle 102' },
    'Jeudi': { subject: 'Mathématiques', class: 'CM1 A', room: 'Salle 101' },
    'Vendredi': null,
  },
  '09:15': {
    'Lundi': { subject: 'Français', class: 'CM1 A', room: 'Salle 101' },
    'Mardi': { subject: 'Sciences', class: 'CM2 B', room: 'Salle 103' },
    'Mercredi': null,
    'Jeudi': { subject: 'Français', class: 'CM1 A', room: 'Salle 101' },
    'Vendredi': { subject: 'Mathématiques', class: 'CM2 B', room: 'Salle 102' },
  },
  '11:00': {
    'Lundi': { subject: 'Sciences', class: 'CM2 B', room: 'Salle 103' },
    'Mardi': { subject: 'Mathématiques', class: 'CM1 A', room: 'Salle 101' },
    'Mercredi': { subject: 'Mathématiques', class: 'CM1 A', room: 'Salle 101' },
    'Jeudi': null,
    'Vendredi': { subject: 'Français', class: 'CM1 A', room: 'Salle 101' },
  },
  '14:00': {
    'Lundi': null,
    'Mardi': { subject: 'Français', class: 'CM2 B', room: 'Salle 102' },
    'Mercredi': { subject: 'Sciences', class: 'CM2 B', room: 'Salle 103' },
    'Jeudi': { subject: 'Sciences', class: 'CM2 B', room: 'Salle 103' },
    'Vendredi': { subject: 'Sciences', class: 'CM1 A', room: 'Salle 101' },
  },
  '15:45': {
    'Lundi': { subject: 'Histoire-Géo', class: 'CM2 B', room: 'Salle 104' },
    'Mardi': null,
    'Mercredi': null,
    'Jeudi': { subject: 'Histoire-Géo', class: 'CM2 B', room: 'Salle 104' },
    'Vendredi': null,
  },
};

export const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
    const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);
    return timeSlots
      .map(slot => ({
        ...slot,
        course: mockSchedule[slot.start]?.[capitalizedToday] || null,
      }))
      .filter(item => item.course !== null);
  };

  const todaySchedule = getTodaySchedule();

  return (
    <TeacherLayout title="Emploi du Temps" subtitle="Consulter votre planning hebdomadaire">
      <div className="space-y-4 md:space-y-6">
        {/* Planning d'aujourd'hui */}
        <Card className="border-0 shadow-lg">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 md:px-6 py-3 md:py-4 rounded-t-lg">
            <h3 className="text-blue-900 font-bold text-base md:text-lg">Aujourd'hui</h3>
          </div>
          <div className="p-4 md:p-6">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-blue-600 text-sm md:text-base">Aucun cours prévu aujourd'hui</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {todaySchedule.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 mb-1 font-medium">{item.label}</p>
                        <p className="font-semibold text-blue-900 text-base md:text-lg truncate">{item.course?.subject}</p>
                        <p className="text-xs md:text-sm text-blue-700">{item.course?.class}</p>
                        {item.course?.room && (
                          <p className="text-xs text-blue-600 mt-1">📍 {item.course.room}</p>
                        )}
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-blue-900 font-bold text-xs md:text-sm shadow-md flex-shrink-0">
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
        <Card className="hidden lg:block border-0 shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
            <h3 className="text-white font-bold text-lg">Planning Hebdomadaire</h3>
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
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 shadow-md'
                        : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 hover:from-blue-200 hover:to-blue-100'
                    }`}
                    title="Sélectionner le jour"
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
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center shadow-md">
                      {slot.label}
                    </div>
                    {daysOfWeek.map((day) => {
                      const course = mockSchedule[slot.start]?.[day];
                      const isSelected = selectedDay === day && selectedTime === slot.start;
                      return (
                        <div
                          key={`${slot.start}-${day}`}
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer min-h-[80px] ${
                            course
                              ? isSelected
                                ? 'bg-gradient-to-br from-yellow-200 to-yellow-100 border-yellow-400 shadow-lg'
                                : 'bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:border-blue-300 hover:shadow-md'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => {
                            setSelectedDay(day);
                            setSelectedTime(slot.start);
                          }}
                        >
                          {course ? (
                            <div>
                              <p className="font-semibold text-blue-900 text-sm mb-1">{course.subject}</p>
                              <p className="text-xs text-blue-700 mb-1">{course.class}</p>
                              {course.room && (
                                <p className="text-xs text-blue-600">📍 {course.room}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-gray-400 text-xs">-</span>
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

        {/* Emploi du temps hebdomadaire - Vue Mobile/Tablette */}
        <div className="lg:hidden space-y-4">
          {daysOfWeek.map((day) => {
            const dayCourses = timeSlots
              .map(slot => ({
                ...slot,
                course: mockSchedule[slot.start]?.[day] || null,
              }))
              .filter(item => item.course !== null);

            if (dayCourses.length === 0) return null;

            return (
              <Card key={day} className="border-0 shadow-lg">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg">
                  <h3 className="text-white font-bold text-base">{day}</h3>
                </div>
                <div className="p-4 space-y-2">
                  {dayCourses.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-blue-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-600 mb-1 font-medium">{item.label}</p>
                          <p className="font-semibold text-blue-900 text-sm md:text-base truncate">{item.course?.subject}</p>
                          <p className="text-xs text-blue-700">{item.course?.class}</p>
                          {item.course?.room && (
                            <p className="text-xs text-blue-600 mt-1">📍 {item.course.room}</p>
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-sm md:text-lg font-semibold">Heures par semaine</h3>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">20h</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-sm md:text-lg font-semibold">Cours aujourd'hui</h3>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{todaySchedule.length}</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white sm:col-span-2 lg:col-span-1">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-sm md:text-lg font-semibold">Classes</h3>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">2</p>
            </div>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
};

