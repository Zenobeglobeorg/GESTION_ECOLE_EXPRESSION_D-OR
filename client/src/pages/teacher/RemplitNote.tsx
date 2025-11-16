import React, { useState } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Button } from '../../components/ui/Button';

// Données fictives pour le tableau
const DUMMY_STUDENTS = [
  { id: 1, nomPrenom: 'Mbarga Jean', notes: {} as Record<string, number> },
  { id: 2, nomPrenom: 'Ndi Sophie', notes: {} as Record<string, number> },
  { id: 3, nomPrenom: 'Etoa Marc', notes: {} as Record<string, number> },
  { id: 4, nomPrenom: 'Kouassi Paul', notes: {} as Record<string, number> },
  { id: 5, nomPrenom: 'Traore Amina', notes: {} as Record<string, number> },
];

const SEQUENCES = [
  'Trim1_Seq1', 'Trim1_Seq2',
  'Trim2_Seq3', 'Trim2_Seq4',
  'Trim3_Seq5', 'Trim3_Seq6'
];

export default function RemplitNote() {
  const [classeSelectionnee, setClasseSelectionnee] = useState('');
  const [matiereSelectionnee, setMatiereSelectionnee] = useState('');
  const [studentsData, setStudentsData] = useState(DUMMY_STUDENTS);

  // Fonction pour mettre à jour une note spécifique
  const handleNoteChange = (studentId: number, trimSeq: string, newValue: string) => {
    const noteValue = newValue === '' ? 0 : parseFloat(newValue);

    setStudentsData(prevData =>
      prevData.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            notes: {
              ...student.notes,
              [trimSeq]: noteValue,
            },
          };
        }
        return student;
      })
    );
  };

  const handleSavePDF = () => {
    console.log('Données à enregistrer/générer PDF :', { classeSelectionnee, matiereSelectionnee, studentsData });
    alert('Tentative d\'enregistrement des données pour le PDF...');
  };

  return (
    <TeacherLayout title="Remplissage de Notes d'évaluations" subtitle="Saisir les notes des élèves">
      <div className="space-y-4 md:space-y-6">
        {/* Barres de sélection */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-300 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="relative">
              <label htmlFor="classe" className="absolute -top-3 left-4 px-2 bg-white text-xs md:text-sm font-medium text-blue-900">
                Classe *
              </label>
              <select
                id="classe"
                value={classeSelectionnee}
                onChange={(e) => setClasseSelectionnee(e.target.value)}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-blue-300 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 text-blue-900 text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="" disabled>Sélectionner la classe</option>
                <option value="Tle A">Tle A</option>
                <option value="1ère C">1ère C</option>
                <option value="Terminale">Terminale</option>
              </select>
            </div>

            <div className="relative">
              <label htmlFor="matiere" className="absolute -top-3 left-4 px-2 bg-white text-xs md:text-sm font-medium text-blue-900">
                Matière *
              </label>
              <select
                id="matiere"
                value={matiereSelectionnee}
                onChange={(e) => setMatiereSelectionnee(e.target.value)}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-blue-300 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 text-blue-900 text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="" disabled>Sélectionner la matière</option>
                <option value="Maths">Maths</option>
                <option value="Philo">Philo</option>
                <option value="Français">Français</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bouton Fiches de Prélèvement */}
        <div className="text-center">
          <Button className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-lg hover:from-gray-500 hover:to-gray-600 shadow-md w-full md:w-auto">
            Ma Fiches de Prélèvement de Notes
          </Button>
        </div>

        {/* Vue Desktop - Tableau */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg border-2 border-blue-300 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* En-tête du tableau */}
              <div className="grid grid-cols-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm">
                <div className="col-span-1 p-3 border-r border-blue-500 flex items-center justify-center">
                  Nom et Prénom
                </div>
                <div className="col-span-2 p-3 border-r border-blue-500 flex items-center justify-center">
                  Trim 1
                </div>
                <div className="col-span-2 p-3 border-r border-blue-500 flex items-center justify-center">
                  Trim 2
                </div>
                <div className="col-span-3 p-3 flex items-center justify-center">
                  Trim 3
                </div>
              </div>
              <div className="grid grid-cols-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-xs">
                <div className="col-span-1 p-2 border-r border-blue-400"></div>
                <div className="col-span-1 p-2 border-r border-blue-400 text-center">Seq 1</div>
                <div className="col-span-1 p-2 border-r border-blue-400 text-center">Seq 2</div>
                <div className="col-span-1 p-2 border-r border-blue-400 text-center">Seq 3</div>
                <div className="col-span-1 p-2 border-r border-blue-400 text-center">Seq 4</div>
                <div className="col-span-1 p-2 border-r border-blue-400 text-center">Seq 5</div>
                <div className="col-span-2 p-2 text-center">Seq 6</div>
              </div>

              {/* Corps du tableau */}
              {studentsData.map((student) => (
                <div key={student.id} className="grid grid-cols-8 border-t border-blue-200 hover:bg-blue-50 transition-colors">
                  <div className="col-span-1 p-3 border-r border-blue-200 text-blue-900 font-medium flex items-center text-sm">
                    {student.nomPrenom}
                  </div>
                  {SEQUENCES.map((seqKey, index) => (
                    <div key={index} className="col-span-1 p-2 border-r border-blue-200">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={student.notes[seqKey] || ''}
                        onChange={(e) => handleNoteChange(student.id, seqKey, e.target.value)}
                        className="w-full px-2 py-1 text-center border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-blue-900 text-sm"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vue Mobile/Tablette - Cartes par élève */}
        <div className="lg:hidden space-y-4">
          {studentsData.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-lg border-2 border-blue-300 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                <h4 className="text-white font-bold text-sm md:text-base">{student.nomPrenom}</h4>
              </div>
              <div className="p-4 space-y-4">
                {/* Trimestre 1 */}
                <div>
                  <h5 className="text-xs md:text-sm font-semibold text-blue-900 mb-2">Trimestre 1</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {SEQUENCES.filter(s => s.startsWith('Trim1')).map((seqKey, idx) => (
                      <div key={idx} className="flex flex-col">
                        <label className="text-xs text-blue-600 mb-1">Seq {idx + 1}</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={student.notes[seqKey] || ''}
                          onChange={(e) => handleNoteChange(student.id, seqKey, e.target.value)}
                          className="w-full px-2 py-2 text-center border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-blue-900 font-semibold bg-gradient-to-r from-yellow-50 to-white"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trimestre 2 */}
                <div>
                  <h5 className="text-xs md:text-sm font-semibold text-blue-900 mb-2">Trimestre 2</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {SEQUENCES.filter(s => s.startsWith('Trim2')).map((seqKey, idx) => (
                      <div key={idx} className="flex flex-col">
                        <label className="text-xs text-blue-600 mb-1">Seq {idx + 1}</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={student.notes[seqKey] || ''}
                          onChange={(e) => handleNoteChange(student.id, seqKey, e.target.value)}
                          className="w-full px-2 py-2 text-center border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-blue-900 font-semibold bg-gradient-to-r from-yellow-50 to-white"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trimestre 3 */}
                <div>
                  <h5 className="text-xs md:text-sm font-semibold text-blue-900 mb-2">Trimestre 3</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {SEQUENCES.filter(s => s.startsWith('Trim3')).map((seqKey, idx) => (
                      <div key={idx} className="flex flex-col">
                        <label className="text-xs text-blue-600 mb-1">Seq {idx + 1}</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={student.notes[seqKey] || ''}
                          onChange={(e) => handleNoteChange(student.id, seqKey, e.target.value)}
                          className="w-full px-2 py-2 text-center border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-blue-900 font-semibold bg-gradient-to-r from-yellow-50 to-white"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton Enregistrer */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleSavePDF}
            className="w-full md:w-auto px-6 md:px-12 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-base md:text-lg rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all"
          >
            Enregistrer.PDF
          </Button>
        </div>
      </div>
    </TeacherLayout>
  );
}
