import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";

interface Student {
  id: number;
  name: string;
  class: string;
  birthDate: string;
  currentParent?: string;
}

interface Parent {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export const StudentsAssociate = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [students] = useState<Student[]>([
    {
      id: 1,
      name: "Ahmed Ali",
      class: "6e A",
      birthDate: "2012-05-15",
      currentParent: "Amira Ali",
    },
    {
      id: 2,
      name: "Fatima Hassan",
      class: "6e B",
      birthDate: "2012-08-22",
    },
    {
      id: 3,
      name: "Mohamed Karim",
      class: "5e A",
      birthDate: "2013-02-10",
      currentParent: "Laila Karim",
    },
  ]);
  const [parents] = useState<Parent[]>([
    { id: 1, name: "Amira Ali", email: "amira@email.com", phone: "06 12 34 56 78" },
    {
      id: 2,
      name: "Ibrahim Hassan",
      email: "ibrahim@email.com",
      phone: "06 98 76 54 32",
    },
    { id: 3, name: "Laila Karim", email: "laila@email.com", phone: "06 55 44 33 22" },
  ]);

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedParent) {
      alert("Veuillez sélectionner un élève et un parent");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/students/associate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            parentId: selectedParent.id,
          }),
        }
      );
      if (!response.ok) throw new Error("Erreur lors de l'association");
      alert("Association créée avec succès");
      setSelectedStudent(null);
      setSelectedParent(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  return (
    <AdminLayout
      title="Association Élèves / Parents"
      subtitle="Sélectionnez un élève et un parent à relier entre eux."
    >
      <form onSubmit={handleAssociate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <div className="p-4">
            <h2 className="font-bold text-lg text-blue-900 mb-3">Sélection de l&apos;élève</h2>
            <div className="mb-4 max-h-80 overflow-y-auto border border-blue-100 rounded-xl">
              {students.map(student => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border-b border-blue-50 cursor-pointer transition-colors ${
                    selectedStudent?.id === student.id
                      ? "bg-blue-100 border-l-4 border-l-blue-500"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <p className="font-semibold text-blue-900">{student.name}</p>
                  <p className="text-sm text-blue-700/70">Classe : {student.class}</p>
                  <p className="text-sm text-blue-700/70">Né(e) : {student.birthDate}</p>
                  {student.currentParent && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Parent actuel : {student.currentParent}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {selectedStudent && (
              <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-900 border border-blue-100">
                <p className="font-semibold">{selectedStudent.name}</p>
                <p>Classe : {selectedStudent.class}</p>
                <p>Naissance : {selectedStudent.birthDate}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="border-0 shadow-lg">
          <div className="p-4">
            <h2 className="font-bold text-lg text-blue-900 mb-3">Sélection du parent</h2>
            <div className="mb-4 max-h-80 overflow-y-auto border border-blue-100 rounded-xl">
              {parents.map(parent => (
                <div
                  key={parent.id}
                  onClick={() => setSelectedParent(parent)}
                  className={`p-4 border-b border-blue-50 cursor-pointer transition-colors ${
                    selectedParent?.id === parent.id
                      ? "bg-yellow-100 border-l-4 border-l-yellow-500"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <p className="font-semibold text-blue-900">{parent.name}</p>
                  <p className="text-sm text-blue-700/80">Email : {parent.email}</p>
                  <p className="text-sm text-blue-700/80">Tél : {parent.phone}</p>
                </div>
              ))}
            </div>
            {selectedParent && (
              <div className="p-4 bg-yellow-50 rounded-xl text-sm text-blue-900 border border-yellow-200">
                <p className="font-semibold">{selectedParent.name}</p>
                <p>Email : {selectedParent.email}</p>
                <p>Téléphone : {selectedParent.phone}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="col-span-1 md:col-span-2 flex justify-end">
          <Button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-lg"
          >
            Confirmer l&apos;association
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};
