import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import * as gradeService from '../../services/gradeService';
import * as bulletinService from '../../services/bulletinService';
import { BulletinGenerator } from '../../components/bulletins/BulletinGenerator';

const NotesBulletinsPage: React.FC = () => {
  const { selectedChild } = useSelectedChild();
  const [activeTab, setActiveTab] = useState<'notes' | 'bulletins'>('notes');
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingBulletins, setLoadingBulletins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les notes
  const [grades, setGrades] = useState<gradeService.Grade[]>([]);
  
  // États pour les bulletins
  const [bulletins, setBulletins] = useState<bulletinService.Bulletin[]>([]);
  
  // --- NOUVEAUX ÉTATS POUR LA MODALE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<bulletinService.Bulletin | null>(null);
  
  // Charger les notes de l'enfant sélectionné
  useEffect(() => {
    const loadGrades = async () => {
      if (!selectedChild) return;
      
      try {
        setLoadingGrades(true);
        setError(null);
        // Utiliser l'endpoint spécifique pour les parents
        const allGrades = await gradeService.getMyChildrenGrades();
        // Filtrer les notes de l'enfant sélectionné
        const childGrades = allGrades.filter(g => g.student?.id === selectedChild.id);
        setGrades(childGrades);
      } catch (err) {
        console.error('Erreur lors du chargement des notes:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notes');
      } finally {
        setLoadingGrades(false);
      }
    };
    
    loadGrades();
  }, [selectedChild]);
  
  // Charger les bulletins de l'enfant sélectionné
  useEffect(() => {
    const loadBulletins = async () => {
      if (!selectedChild) return;
      
      try {
        setLoadingBulletins(true);
        setError(null);
        console.log('Chargement des bulletins pour l\'élève:', selectedChild.id);
        const childBulletins = await bulletinService.getStudentBulletins(selectedChild.id);
        console.log('Bulletins reçus du backend:', childBulletins);
        console.log('Nombre de bulletins:', childBulletins.length);
        
        // Le backend filtre déjà les bulletins publiés pour les parents
        // Donc tous les bulletins retournés sont déjà publiés
        setBulletins(childBulletins);
        
        if (childBulletins.length === 0) {
          console.log('Aucun bulletin publié trouvé pour cet élève');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des bulletins:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des bulletins');
      } finally {
        setLoadingBulletins(false);
      }
    };
    
    if (activeTab === 'bulletins') {
      loadBulletins();
    }
  }, [selectedChild, activeTab]);

  // --- NOUVELLES FONCTIONS POUR GÉRER LA MODALE ---
  const handleOpenModal = (bulletin: bulletinService.Bulletin) => {
    setSelectedBulletin(bulletin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Petit délai pour l'animation de sortie
    setTimeout(() => setSelectedBulletin(null), 300); 
  };
  
  // Grouper les notes par matière
  const gradesBySubject = grades.reduce((acc, grade) => {
    const subjectName = grade.subject?.name || 'Autre';
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(grade);
    return acc;
  }, {} as { [key: string]: gradeService.Grade[] });
  
  // Calculer les moyennes par matière
  const subjectAverages = Object.entries(gradesBySubject).map(([subject, subjectGrades]) => {
    // Utiliser grade (sur 20) ou score (sur 10) converti en /20
    const validGrades = subjectGrades
      .filter(g => (g.grade !== null && g.grade !== undefined) || (g.score !== null && g.score !== undefined))
      .map(g => {
        if (g.grade !== null && g.grade !== undefined) {
          return g.grade; // Déjà sur 20
        }
        return (g.score || 0) * 2; // Convertir de /10 à /20
      });
    const average = validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
      : 0;
    return {
      subject,
      average,
      grades: subjectGrades.map(g => {
        let gradeDisplay = 'N/A';
        if (g.grade !== null && g.grade !== undefined) {
          gradeDisplay = `${g.grade.toFixed(1)}/20`;
        } else if (g.score !== null && g.score !== undefined) {
          gradeDisplay = `${g.score.toFixed(1)}/10`;
        } else if (g.evaluationText) {
          gradeDisplay = g.evaluationText;
        }
        return {
          title: g.evaluation?.name || 'Évaluation',
          grade: gradeDisplay,
        };
      }),
    };
  });
  
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
            {!selectedChild ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Veuillez sélectionner un enfant dans l'en-tête pour voir ses notes.
                </p>
              </div>
            ) : loadingGrades ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                {error}
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                  Voici le détail des notes obtenues par {selectedChild.firstName} {selectedChild.lastName}. 
                  Les moyennes sont calculées en temps réel.
                </p>
                
                {subjectAverages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      Aucune note disponible pour le moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {subjectAverages.map((subject) => (
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
                )}
              </>
            )}
          </div>
        )}

        {/* --- Contenu de l'onglet "Bulletins" --- */}
        {activeTab === 'bulletins' && (
          // AJOUT: Classes Dark Mode
          <div className="p-6">
            {!selectedChild ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Veuillez sélectionner un enfant dans l'en-tête pour voir ses bulletins.
                </p>
              </div>
            ) : loadingBulletins ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                {error}
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                  Bulletins officiels de {selectedChild.firstName} {selectedChild.lastName} publiés par l'établissement.
                </p>
                
                {bulletins.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Aucun bulletin publié pour le moment.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Les bulletins doivent être créés et publiés par l'administration pour être visibles ici.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bulletins.map((bulletin) => (
                      <div key={bulletin.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            Bulletin {bulletin.type === 'MATERNELLE' ? 'Maternelle' : 'Primaire'} - {bulletin.academicYear}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Publié le : {new Date(bulletin.updatedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        
                        {/* --- GROUPE DE BOUTONS MODIFIÉ --- */}
                        <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                          {/* (Bouton Voir - NOUVEAU) - Style Jaune (action secondaire) */}
                          <button
                            type="button"
                            onClick={() => handleOpenModal(bulletin)}
                            className="px-5 py-2 text-sm font-medium text-yellow-900 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors"
                          >
                            Voir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
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
                  Bulletin {selectedBulletin.type === 'MATERNELLE' ? 'Maternelle' : 'Primaire'} - {selectedBulletin.academicYear}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Fermer"
                  title="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Corps de la Modale - Afficher le bulletin */}
              <div className="p-6 overflow-auto max-h-[80vh]">
                {selectedChild && selectedBulletin && (
                  <BulletinGenerator
                    student={{
                      id: selectedChild.id,
                      firstName: selectedChild.firstName,
                      lastName: selectedChild.lastName,
                      class: selectedChild.class ? {
                        id: selectedChild.class.id,
                        name: selectedChild.class.name,
                        level: selectedChild.class.level || '',
                      } : undefined,
                    }}
                    academicYear={selectedBulletin.academicYear}
                    bulletinId={selectedBulletin.id}
                    mode="preview"
                    onClose={handleCloseModal}
                  />
                )}
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default NotesBulletinsPage;