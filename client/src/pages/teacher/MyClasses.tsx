import { useState } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

// Données fictives pour les classes
const mockClasses = [
  {
    id: 1,
    name: 'CM1 A',
    level: 'CM1',
    studentsCount: 25,
    subjects: ['Mathématiques', 'Français', 'Sciences'],
    teacher: 'M. Dupont',
    year: '2024-2025',
  },
  {
    id: 2,
    name: 'CM2 B',
    level: 'CM2',
    studentsCount: 23,
    subjects: ['Mathématiques', 'Français', 'Histoire-Géo'],
    teacher: 'M. Dupont',
    year: '2024-2025',
  },
];

const mockStudents = [
  { id: 1, name: 'Dupont Jean', classId: 1 },
  { id: 2, name: 'Martin Sophie', classId: 1 },
  { id: 3, name: 'Lefevre Marc', classId: 1 },
  { id: 4, name: 'Dubois Alice', classId: 2 },
  { id: 5, name: 'Petit Thomas', classId: 2 },
];

export const MyClasses = () => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const getStudentsByClass = (classId: number) => {
    return mockStudents.filter(s => s.classId === classId);
  };

  const selectedClassData = selectedClass ? mockClasses.find(c => c.id === selectedClass) : null;
  const selectedClassStudents = selectedClass ? getStudentsByClass(selectedClass) : [];

  return (
    <TeacherLayout title="Mes Classes" subtitle="Gérer vos classes et vos élèves">
      <div className="space-y-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total Classes</h3>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">{mockClasses.length}</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total Élèves</h3>
                <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">{mockStudents.length}</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Matières</h3>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold">
                {new Set(mockClasses.flatMap(c => c.subjects)).size}
              </p>
            </div>
          </Card>
        </div>

        {/* Liste des classes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
                <h3 className="text-white font-bold text-lg">Mes Classes Assignées</h3>
              </div>
              <div className="p-6 space-y-4">
                {mockClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-600">Aucune classe assignée</p>
                  </div>
                ) : (
                  mockClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedClass === classItem.id
                          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg'
                          : 'border-blue-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedClass(classItem.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-blue-900 mb-1">{classItem.name}</h4>
                          <p className="text-sm text-blue-600">Niveau: {classItem.level}</p>
                          <p className="text-sm text-blue-600">Année: {classItem.year}</p>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {classItem.studentsCount}
                          </div>
                          <p className="text-xs text-blue-600 mt-1">élèves</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Matières enseignées:</p>
                        <div className="flex flex-wrap gap-2">
                          {classItem.subjects.map((subject, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-yellow-50 text-blue-900 text-xs font-semibold rounded-full border border-yellow-300"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/teacher/Presence?class=${classItem.id}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2 rounded-lg hover:from-blue-700 hover:to-blue-800">
                            Présences
                          </Button>
                        </Link>
                        <Link to={`/teacher/RemplitNote?class=${classItem.id}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-semibold py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600">
                            Notes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Détails de la classe sélectionnée */}
          <div>
            {selectedClassData ? (
              <Card className="border-0 shadow-lg sticky top-4">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 rounded-t-lg">
                  <h3 className="text-blue-900 font-bold text-lg">Détails - {selectedClassData.name}</h3>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">Informations</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-700">
                        <span className="font-semibold">Niveau:</span> {selectedClassData.level}
                      </p>
                      <p className="text-blue-700">
                        <span className="font-semibold">Année:</span> {selectedClassData.year}
                      </p>
                      <p className="text-blue-700">
                        <span className="font-semibold">Élèves:</span> {selectedClassData.studentsCount}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">Liste des élèves ({selectedClassStudents.length})</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {selectedClassStudents.length === 0 ? (
                        <p className="text-blue-600 text-sm">Aucun élève</p>
                      ) : (
                        selectedClassStudents.map((student) => (
                          <div
                            key={student.id}
                            className="p-2 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200 text-sm text-blue-900"
                          >
                            {student.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">Matières</h4>
                    <div className="space-y-2">
                      {selectedClassData.subjects.map((subject, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-300 text-sm text-blue-900 font-medium"
                        >
                          {subject}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg border-dashed border-2 border-blue-200 bg-blue-50/20">
                <div className="p-6 text-center">
                  <svg className="w-16 h-16 mx-auto text-blue-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-blue-600 font-medium">Sélectionnez une classe pour voir les détails</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

