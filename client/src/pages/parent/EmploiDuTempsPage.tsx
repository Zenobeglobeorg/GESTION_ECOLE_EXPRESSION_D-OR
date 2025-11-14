// Enregistrez ce fichier sous: src/pages/parent/EmploiDuTempsPage.tsx

import React, { useState } from 'react';

// --- NOUVELLE STRUCTURE DE DONNÉES (POUR LA VUE GRILLE) ---
type CourseSlot = {
  subject: string;
  teacher: string;
  color: string;
} | null; // null représente une case vide

type WeekSchedule = {
  Lundi: CourseSlot[];
  Mardi: CourseSlot[];
  Mercredi: CourseSlot[];
  Jeudi: CourseSlot[];
  Vendredi: CourseSlot[];
};

// Les tranches horaires (basées sur votre image)
const timeSlots = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
];

// Les jours (basés sur votre image)
const days: (keyof WeekSchedule)[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

// --- DONNÉES FACTICES ---
// (J'ai adapté vos anciennes données au nouveau format horaire)
const week1Schedule: WeekSchedule = {
  Lundi: [
    { subject: 'Mathématiques', teacher: 'M. Diallo', color: 'blue' },
    { subject: 'Mathématiques', teacher: 'M. Diallo', color: 'blue' },
    { subject: 'Français', teacher: 'Mme. Ndiaye', color: 'yellow' },
    { subject: 'Français', teacher: 'Mme. Ndiaye', color: 'yellow' },
    null, // Pause 12:00-13:00
    { subject: 'Histoire & Géo', teacher: 'M. Sarr', color: 'green' },
    { subject: 'Histoire & Géo', teacher: 'M. Sarr', color: 'green' },
    null, null,
  ],
  Mardi: [
    { subject: 'Sciences de la Vie', teacher: 'Mme. Fall', color: 'green' },
    { subject: 'Sciences de la Vie', teacher: 'Mme. Fall', color: 'green' },
    { subject: 'Anglais', teacher: 'M. Smith', color: 'red' },
    { subject: 'Anglais', teacher: 'M. Smith', color: 'red' },
    null,
    { subject: 'Mathématiques', teacher: 'M. Diallo', color: 'blue' },
    { subject: 'Mathématiques', teacher: 'M. Diallo', color: 'blue' },
    null, null,
  ],
  Mercredi: [
    { subject: 'Français', teacher: 'Mme. Ndiaye', color: 'yellow' },
    { subject: 'Français', teacher: 'Mme. Ndiaye', color: 'yellow' },
    { subject: 'Education Physique', teacher: 'M. Diouf', color: 'orange' },
    { subject: 'Education Physique', teacher: 'M. Diouf', color: 'orange' },
    null, null, null, null, null,
  ],
  Jeudi: [
    { subject: 'Mathématiques', teacher: 'M. Diallo', color: 'blue' },
    { subject: 'Mathématiques', teacher: 'M. Diallo', color: 'blue' },
    { subject: 'Français', teacher: 'Mme. Ndiaye', color: 'yellow' },
    { subject: 'Français', teacher: 'Mme. Ndiaye', color: 'yellow' },
    null,
    { subject: 'Arts Plastiques', teacher: 'Mme. Kante', color: 'purple' },
    { subject: 'Arts Plastiques', teacher: 'Mme. Kante', color: 'purple' },
    null, null,
  ],
  Vendredi: [
    { subject: 'Anglais', teacher: 'M. Smith', color: 'red' },
    { subject: 'Anglais', teacher: 'M. Smith', color: 'red' },
    { subject: 'Sciences de la Vie', teacher: 'Mme. Fall', color: 'green' },
    { subject: 'Sciences de la Vie', teacher: 'Mme. Fall', color: 'green' },
    null, null, null, null, null,
  ],
};

// Simulation de 4 semaines pour le mois de Novembre
const mockWeeklySchedules = [
  { weekName: 'Semaine 1 (03-07 Nov)', schedule: week1Schedule },
  { weekName: 'Semaine 2 (10-14 Nov)', schedule: week1Schedule }, // (Réutilisation pour l'exemple)
  { weekName: 'Semaine 3 (17-21 Nov)', schedule: week1Schedule },
  { weekName: 'Semaine 4 (24-28 Nov)', schedule: week1Schedule },
];
// ---

const EmploiDuTempsPage: React.FC = () => {
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  const currentSchedule = mockWeeklySchedules[activeWeekIndex];

  const handlePrint = () => {
    // Une fonction d'impression simple (peut être améliorée avec CSS @print)
    window.print();
  };

  return (
    // Conteneur principal (adapté au Dark Mode)
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
        
        {/* EN-TÊTE */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          
          {/* Titre et Bouton Imprimer */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">
              Emploi du Temps - Novembre 2025
            </h2>
            <button
              onClick={handlePrint}
              // Style Bleu (action primaire)
              className="mt-2 sm:mt-0 px-5 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Imprimer l'emploi du temps
            </button>
          </div>
          
          {/* Onglets des Semaines (Style Bleu/Jaune) */}
          <div className="flex flex-wrap -mb-px space-x-1">
            {mockWeeklySchedules.map((week, index) => (
              <button
                key={week.weekName}
                type="button"
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                  activeWeekIndex === index
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-yellow-900 hover:bg-yellow-100 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
                onClick={() => setActiveWeekIndex(index)}
              >
                {week.weekName}
              </button>
            ))}
          </div>
        </div>

        {/* Conteneur de la Grille (permet le défilement horizontal sur mobile) */}
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
            
            {/* En-tête du tableau (Bleu) */}
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-sm font-semibold text-left border border-blue-700">Heure</th>
                {days.map(day => (
                  <th key={day} className="p-3 text-sm font-semibold text-left border border-blue-700 min-w-[150px]">{day}</th>
                ))}
              </tr>
            </thead>
            
            {/* Corps du tableau */}
            <tbody>
              {timeSlots.map((time, timeIndex) => (
                <tr 
                  key={time} 
                  className="bg-white dark:bg-gray-800 even:bg-gray-50 dark:even:bg-gray-700/50 transition-colors"
                >
                  {/* Cellule de l'heure */}
                  <td className="p-3 text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                    {time}
                  </td>
                  
                  {/* Cellules des cours */}
                  {days.map(day => {
                    const course = currentSchedule.schedule[day][timeIndex];
                    return (
                      <td key={day} className="p-3 text-sm border border-gray-300 dark:border-gray-600 align-top">
                        {course ? (
                          // Contenu de la case
                          <div>
                            <p className="font-semibold text-blue-800 dark:text-blue-400">{course.subject}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">{course.teacher}</p>
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
        </div>

    </div>
  );
};

export default EmploiDuTempsPage;