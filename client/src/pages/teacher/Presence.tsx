import { useState } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Button } from '../../components/ui/Button';

// Données fictives pour le tableau
const mockStudents = [
  { id: 1, name: "Dupont Jean" },
  { id: 2, name: "Martin Sophie" },
  { id: 3, name: "Lefevre Marc" },
  { id: 4, name: "Dubois Alice" },
  { id: 5, name: "Petit Thomas" },
  { id: 6, name: "Garnier Paul" },
];

const initialPresence = mockStudents.reduce((acc, student) => {
  acc[student.id] = 'Present';
  return acc;
}, {} as Record<number, 'Present' | 'Absent'>);

export function Presence() {
  const [presence, setPresence] = useState<Record<number, 'Present' | 'Absent'>>(initialPresence);
  const [selectedMatiere, setSelectedMatiere] = useState('ECM');

  const handleTogglePresence = (studentId: number, status: 'Present' | 'Absent') => {
    setPresence(prevPresence => ({
      ...prevPresence,
      [studentId]: status,
    }));
  };

  const handleSave = () => {
    console.log('Enregistrement des présences:', presence);
    alert('Présences enregistrées avec succès!');
  };

  return (
    <TeacherLayout title="Présences" subtitle="Marquer les présences des élèves">
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        {/* Tableau de présence */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">Liste des élèves</h3>
            <div className="flex items-center gap-3">
              <label htmlFor="matiere" className="text-sm font-medium text-blue-700">Matière:</label>
              <select
                title="Sélectionner la matière"
                id="matiere"
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="px-4 py-2 border border-blue-300 rounded-lg bg-yellow-50 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="ECM">ECM</option>
                <option value="MATHS">MATHS</option>
                <option value="FRANCAIS">FRANÇAIS</option>
                <option value="ANGLAIS">ANGLAIS</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold border border-blue-500">Nom et Prénom</th>
                  <th className="px-6 py-4 text-center font-semibold border border-blue-500">Présent</th>
                  <th className="px-6 py-4 text-center font-semibold border border-blue-500">Absent</th>
                </tr>
              </thead>
              <tbody>
                {mockStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 border border-blue-200 text-blue-900 font-medium">
                      {student.name}
                    </td>
                    <td
                      className={`px-6 py-4 text-center border border-blue-200 cursor-pointer transition-all ${
                        presence[student.id] === 'Present'
                          ? 'bg-green-500 text-white font-semibold'
                          : 'bg-gray-50 hover:bg-green-100'
                      }`}
                      onClick={() => handleTogglePresence(student.id, 'Present')}
                    >
                      {presence[student.id] === 'Present' && '✓'}
                    </td>
                    <td
                      className={`px-6 py-4 text-center border border-blue-200 cursor-pointer transition-all ${
                        presence[student.id] === 'Absent'
                          ? 'bg-red-500 text-white font-semibold'
                          : 'bg-gray-50 hover:bg-red-100'
                      }`}
                      onClick={() => handleTogglePresence(student.id, 'Absent')}
                    >
                      {presence[student.id] === 'Absent' && '✗'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              title="Enregistrer les présences"
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all"
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default Presence;
