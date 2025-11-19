// Enregistrez ce fichier sous: src/pages/parent/PresencesPage.tsx

import { useState } from 'react';

// --- DONNÉES FACTICES (MOCK DATA) ---
const mockStats = {
  present: 20,
  absent: 1,
  tardy: 2,
  total: 23,
};

// Simule les jours du mois (juste pour l'exemple, un vrai calendrier serait plus complexe)
const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
const attendanceData = {
  '4': 'absent',
  '12': 'tardy',
  '19': 'tardy',
};
// ---

const PresencesPage = () => {
  // État pour simuler la navigation entre les mois
  const [currentMonth] = useState('Novembre 2025');

  const getDayStatus = (day: number): string => {
    const status = attendanceData[day.toString() as keyof typeof attendanceData];
    if (status === 'absent') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'tardy') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (day <= 23) return 'bg-green-100 text-green-800 border-green-200'; // Passé, présent
    return 'bg-gray-50 text-gray-400 border-gray-200'; // Futur
  };

  return (
    <div className="space-y-6">

      {/* 1. En-tête de la page (style de ProfilParentPage) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-1">
          Suivi des Présences
        </h2>
        <p className="text-sm text-gray-600">Consultez l'assiduité de votre enfant.</p>
      </div>

      {/* 2. Cartes Résumé (style de ParentDashboardHome) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Jours Présent (Vert) */}
        <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm text-white text-opacity-90 mb-1">Jours Présent</p>
          <p className="text-3xl font-bold">{mockStats.present}</p>
        </div>
        {/* Jours Absent (Rouge/Jaune) */}
        <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
          <p className="text-sm text-white text-opacity-90 mb-1">Jours Absent</p>
          <p className="text-3xl font-bold">{mockStats.absent}</p>
        </div>
        {/* Retards (Bleu) */}
        <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm text-white text-opacity-90 mb-1">Retards</p>
          <p className="text-3xl font-bold">{mockStats.tardy}</p>
        </div>
      </div>

      {/* 3. Vue Calendrier (style de ProfilParentPage) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* En-tête du calendrier */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-800">{currentMonth}</h3>
          <div className="flex space-x-2">
            {/* (Couleur : Boutons Bleu/Jaune) */}
            <button className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
              Précédent
            </button>
            <button className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
              Suivant
            </button>
          </div>
        </div>
        
        {/* Grille du calendrier */}
        <div className="p-6">
          {/* Jours de la semaine (simplifié) */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase">{day}</div>
            ))}
          </div>
          
          {/* Jours (simulation) */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map(day => (
              <div 
                key={day} 
                className={`w-full h-16 p-2 rounded-lg border text-sm font-semibold ${getDayStatus(day)}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Légende */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-100 border border-green-200"></div>
              <span className="text-sm text-gray-600">Présent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-200"></div>
              <span className="text-sm text-gray-600">En retard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200"></div>
              <span className="text-sm text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-50 border border-gray-200"></div>
              <span className="text-sm text-gray-600">À venir</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PresencesPage;