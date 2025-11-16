import { useState } from "react";
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function CahierExo() {
  const [selectedClasse, setSelectedClasse] = useState('CM2');
  const [selectedMatiere, setSelectedMatiere] = useState('Anglais');
  const [intitule, setIntitule] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = () => {
    console.log('Soumission:', { selectedClasse, selectedMatiere, intitule, description, date });
    alert('Exercice enregistré avec succès!');
  };

  return (
    <TeacherLayout 
      title="Mon Cahier d'exercice" 
      subtitle="Créer et gérer vos exercices"
      actions={
        <Button 
          onClick={() => alert('Enregistrement de tous les exercices')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg"
        >
          Enregistrer chacun de vos exercices
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sélection Classe et Matière */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Classe :</label>
              <select
                title="Sélectionner la classe"
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="CM2">CM2</option>
                <option value="CM1">CM1</option>
                <option value="CE2">CE2</option>
                <option value="CE1">CE1</option>
                <option value="CP">CP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Matière :</label>
              <select
                title="Sélectionner la matière"
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="Anglais">Anglais</option>
                <option value="Français">Français</option>
                <option value="Maths">Maths</option>
                <option value="Sciences">Sciences</option>
              </select>
            </div>
          </div>

          {/* Card Paramètres */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 mb-4 rounded-t-lg">
              <h3 className="text-white font-bold text-center">Paramètres</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Intitulé :</label>
                <input
                  type="text"
                  value={intitule}
                  onChange={(e) => setIntitule(e.target.value)}
                  placeholder="Géologie"
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 text-blue-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Description :</label>
                <textarea
                  title="Description"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Document :</label>
                <input
                  title="Document"
                  placeholder="Document"
                  type="file"
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 text-blue-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Date :</label>
                <input
                  title="Date"
                  placeholder="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                Submit
              </Button>
            </div>
          </Card>
        </div>

        {/* Colonne droite */}
        <div>
          <Card className="border-0 shadow-lg h-full">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 rounded-t-lg">
              <h3 className="text-blue-900 font-bold text-center">Vos Récents Devoirs</h3>
            </div>
            <div className="p-6 min-h-[350px] bg-gradient-to-br from-gray-50 to-white">
              <p className="text-center text-blue-600 mt-8">Aucun devoir récent</p>
            </div>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default CahierExo;
