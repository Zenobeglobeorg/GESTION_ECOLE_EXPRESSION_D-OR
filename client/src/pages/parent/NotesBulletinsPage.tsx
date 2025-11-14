// Enregistrez ce fichier sous: src/pages/parent/NotesBulletinsPage.tsx

import React, { useState } from 'react';
import { Card } from '../../components/ui/Card'; // Assurez-vous que le chemin est correct

// --- INTERFACE AJOUTÉE POUR LE BULLETIN SÉLECTIONNÉ ---
interface ReportCard {
  id: string;
  name: string;
  date: string;
  url: string;
}

// --- DONNÉES FACTICES (MOCK DATA) ---
const mockGrades = [
  { 
    subject: 'Mathématiques', 
    average: 15.5, 
    grades: [
      { title: 'Devoir 1', grade: '16/20' },
      { title: 'Interrogation', grade: '14/20' },
      { title: 'Projet (Groupe)', grade: '17/20' },
    ]
  },
  { 
    subject: 'Français', 
    average: 14, 
    grades: [
      { title: 'Dictée 1', grade: '12/20' },
      { title: 'Rédaction', grade: '15/20' },
      { title: 'Exposé Oral', grade: '16/20' },
    ]
  },
  { 
    subject: 'Histoire & Géographie', 
    average: 17, 
    grades: [
      { title: 'Contrôle T1', grade: '17/20' },
    ]
  },
];

const mockReportCards: ReportCard[] = [
  { id: 'T1', name: 'Bulletin Trimestre 1', date: '20 Décembre 2024', url: '#' },
  { id: 'T2', name: 'Bulletin Trimestre 2', date: '28 Mars 2025', url: '#' },
];
// ---

const NotesBulletinsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'bulletins'>('notes');
  
  // --- NOUVEAUX ÉTATS POUR LA MODALE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<ReportCard | null>(null);

  // --- NOUVELLES FONCTIONS POUR GÉRER LA MODALE ---
  const handleOpenModal = (report: ReportCard) => {
    setSelectedBulletin(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Petit délai pour l'animation de sortie
    setTimeout(() => setSelectedBulletin(null), 300); 
  };
  
  return (
    // On utilise le même conteneur blanc que ProfilParentPage
    // AJOUT: Classes Dark Mode
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
        
        {/* EN-TÊTE AVEC ONGLETS */}
        {/* AJOUT: Classes Dark Mode */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-4">
            Notes & Bulletins
          </h2>
          
          <div className="flex space-x-1">
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'notes'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-yellow-900 hover:bg-yellow-100 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('notes')}
            >
              Notes par matière
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'bulletins'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-yellow-900 hover:bg-yellow-100 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('bulletins')}
            >
              Bulletins (PDF)
            </button>
          </div>
        </div>

        {/* --- Contenu de l'onglet "Notes par matière" --- */}
        {activeTab === 'notes' && (
          // AJOUT: Classes Dark Mode
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              Voici le détail des notes obtenues par l'enfant. Les moyennes sont calculées en temps réel.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockGrades.map((subject) => (
                // La Card gère son propre mode sombre si elle est bien faite
                <Card key={subject.subject} className="border-0 shadow-lg">
                  {/* AJOUT: Classes Dark Mode */}
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">{subject.subject}</h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{subject.average.toFixed(2)}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/20</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Moyenne</p>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {subject.grades.length > 0 ? (
                      subject.grades.map((grade) => (
                        <div key={grade.title} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-200">{grade.title}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{grade.grade}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">Aucune note pour le moment.</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* --- Contenu de l'onglet "Bulletins" --- */}
        {activeTab === 'bulletins' && (
          // AJOUT: Classes Dark Mode
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              Téléchargez les bulletins trimestriels officiels de l'établissement au format PDF.
            </p>
            
            <div className="space-y-4">
              {mockReportCards.map((report) => (
                <div key={report.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{report.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Disponible depuis le : {report.date}</p>
                  </div>
                  
                  {/* --- GROUPE DE BOUTONS MODIFIÉ --- */}
                  <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                    {/* (Bouton Voir - NOUVEAU) - Style Jaune (action secondaire) */}
                    <button
                      type="button"
                      onClick={() => handleOpenModal(report)}
                      className="px-5 py-2 text-sm font-medium text-yellow-900 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      Voir
                    </button>
                    
                    {/* (Bouton Télécharger - INCHANGÉ) - Style Bleu (action primaire) */}
                    <a
                      href={report.url}
                      download
                      className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-center"
                    >
                      Télécharger
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MODALE D'AFFICHAGE DU BULLETIN (NOUVEAU) --- */}
        {isModalOpen && selectedBulletin && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            // `onMouseDown` est utilisé pour fermer si on clique sur le fond (overlay)
            onMouseDown={handleCloseModal} 
          >
            {/* Overlay (Fond sombre) */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out" 
                 style={{ opacity: isModalOpen ? 1 : 0 }} />

            {/* Contenu de la Modale */}
            <div
              // `onMouseDown` ici empêche la modale de se fermer si on clique à l'intérieur
              onMouseDown={(e) => e.stopPropagation()} 
              className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all duration-300 ease-out"
              style={{ transform: isModalOpen ? 'scale(1)' : 'scale(0.95)', opacity: isModalOpen ? 1 : 0 }}
            >
              {/* En-tête de la Modale */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400">
                  {selectedBulletin.name}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Corps de la Modale (Simulation) */}
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Aperçu du bulletin de {selectedBulletin.name}. (Ceci est une simulation, le vrai PDF sera affiché ici).
                </p>
                {/* Simulation de l'aperçu du PDF */}
                <div className="w-full h-[60vh] bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                  <p className="text-gray-500"></p>
                </div>
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default NotesBulletinsPage;