import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";
import * as studentService from "../../services/studentService";
import * as userService from "../../services/userService";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const StudentsAssociate = () => {
  const [selectedStudent, setSelectedStudent] = useState<studentService.Student | null>(null);
  const [selectedParent, setSelectedParent] = useState<userService.UserWithDate | null>(null);
  const [students, setStudents] = useState<studentService.Student[]>([]);
  const [parents, setParents] = useState<userService.UserWithDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssociating, setIsAssociating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [studentsData, usersData] = await Promise.all([
          studentService.getStudents(),
          userService.getUsers(),
        ]);
        setStudents(studentsData);
        setParents(usersData.filter(u => u.role === 'PARENT'));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
        setError(errorMessage);
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedParent) {
      alert("Veuillez sélectionner un élève et un parent");
      return;
    }

    setIsAssociating(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_BASE_URL}/api/students/associate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          parentId: selectedParent.id,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur lors de l'association");
      }

      const result = await response.json();
      alert(result.message || "Association créée avec succès");
      
      // Recharger les données
      const [studentsData] = await Promise.all([
        studentService.getStudents(),
      ]);
      setStudents(studentsData);
      
      setSelectedStudent(null);
      setSelectedParent(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsAssociating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        title="Association Élèves / Parents"
        subtitle="Sélectionnez un élève et un parent à relier entre eux."
      >
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Association Élèves / Parents"
      subtitle="Sélectionnez un élève et un parent à relier entre eux."
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note :</strong> Cette fonctionnalité permet d'associer ou de réassocier un élève à un parent. 
          Vous pouvez également changer l'association d'un élève déjà associé.
        </p>
      </div>

      <form onSubmit={handleAssociate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <div className="p-4">
            <h2 className="font-bold text-lg text-blue-900 mb-3">Sélection de l&apos;élève</h2>
            <div className="mb-4 max-h-80 overflow-y-auto border border-blue-100 rounded-xl">
              {students.length === 0 ? (
                <div className="p-4 text-center text-blue-600">
                  <p>Aucun élève disponible</p>
                </div>
              ) : (
                students.map(student => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 border-b border-blue-50 cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id
                        ? "bg-blue-100 border-l-4 border-l-blue-500"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <p className="font-semibold text-blue-900">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-blue-700/70">
                      Classe : {student.class?.name ?? student.classId ?? 'Non assigné'}
                    </p>
                    <p className="text-sm text-blue-700/70">
                      Né(e) : {new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}
                    </p>
                    {student.parent && (
                      <p className="text-xs text-yellow-700 mt-1">
                        Parent actuel : {student.parent.firstName} {student.parent.lastName} ({student.parent.email})
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
            {selectedStudent && (
              <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-900 border border-blue-100">
                <p className="font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                <p>Classe : {selectedStudent.class?.name ?? selectedStudent.classId ?? 'Non assigné'}</p>
                <p>Naissance : {new Date(selectedStudent.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                {selectedStudent.parent && (
                  <p className="text-yellow-700 mt-1">
                    Parent actuel : {selectedStudent.parent.firstName} {selectedStudent.parent.lastName}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="p-4">
            <h2 className="font-bold text-lg text-blue-900 mb-3">Sélection du parent</h2>
            <div className="mb-4 max-h-80 overflow-y-auto border border-blue-100 rounded-xl">
              {parents.length === 0 ? (
                <div className="p-4 text-center text-blue-600">
                  <p>Aucun parent disponible</p>
                </div>
              ) : (
                parents.map(parent => {
                  const childrenCount = students.filter(s => s.parentId === parent.id).length;
                  return (
                    <div
                      key={parent.id}
                      onClick={() => setSelectedParent(parent)}
                      className={`p-4 border-b border-blue-50 cursor-pointer transition-colors ${
                        selectedParent?.id === parent.id
                          ? "bg-yellow-100 border-l-4 border-l-yellow-500"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      <p className="font-semibold text-blue-900">{parent.firstName} {parent.lastName}</p>
                      <p className="text-sm text-blue-700/80">Email : {parent.email}</p>
                      {parent.phone && (
                        <p className="text-sm text-blue-700/80">Tél : {parent.phone}</p>
                      )}
                      {childrenCount > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          {childrenCount} enfant{childrenCount > 1 ? 's' : ''} déjà associé{childrenCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {selectedParent && (
              <div className="p-4 bg-yellow-50 rounded-xl text-sm text-blue-900 border border-yellow-200">
                <p className="font-semibold">{selectedParent.firstName} {selectedParent.lastName}</p>
                <p>Email : {selectedParent.email}</p>
                {selectedParent.phone && (
                  <p>Téléphone : {selectedParent.phone}</p>
                )}
                {students.filter(s => s.parentId === selectedParent.id).length > 0 && (
                  <p className="text-blue-700 mt-1">
                    {students.filter(s => s.parentId === selectedParent.id).length} enfant{students.filter(s => s.parentId === selectedParent.id).length > 1 ? 's' : ''} déjà associé{students.filter(s => s.parentId === selectedParent.id).length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="col-span-1 md:col-span-2 flex justify-end">
          <Button
            type="submit"
            disabled={!selectedStudent || !selectedParent || isAssociating}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssociating ? 'Association en cours...' : "Confirmer l'association"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};
