import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  subjects: string[];
  classes: string[];
  experience: number;
}

export const UsersTeachers = () => {
  const [teachersList, setTeachersList] = useState<Teacher[]>([
    {
      id: 1,
      name: "Mr. Dupont",
      email: "dupont@ecole.fr",
      phone: "06 12 34 56 78",
      department: "Mathématiques",
      subjects: ["Mathématiques", "Géométrie"],
      classes: ["6e A", "5e B"],
      experience: 8,
    },
    {
      id: 2,
      name: "Mme. Bernard",
      email: "bernard@ecole.fr",
      phone: "06 98 76 54 32",
      department: "Français",
      subjects: ["Français", "Littérature"],
      classes: ["6e B", "5e A"],
      experience: 12,
    },
  ]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    subjects: [] as string[],
    classes: [] as string[],
    experience: 0,
  });
  const [filterDept, setFilterDept] = useState("");
  const [departments] = useState([
    "Mathématiques",
    "Français",
    "Anglais",
    "Sciences",
    "Histoire-Géographie",
    "EPS",
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/teachers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (!response.ok) throw new Error("Erreur lors de la création");
      const newTeacher: Teacher = {
        id: teachersList.length + 1,
        ...form,
        subjects: [],
        classes: [],
      };
      setTeachersList([...teachersList, newTeacher]);
      setForm({
        name: "",
        email: "",
        phone: "",
        department: "",
        subjects: [],
        classes: [],
        experience: 0,
      });
      alert("Enseignant créé avec succès");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDelete = (id: number) => {
    setTeachersList(teachersList.filter(t => t.id !== id));
  };

  const filteredTeachers = filterDept
    ? teachersList.filter(t => t.department === filterDept)
    : teachersList;

  return (
    <AdminLayout
      title="Gestion des Enseignants"
      subtitle="Ajoutez ou filtrez les professeurs par département."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-lg text-blue-900">Ajouter un enseignant</h2>
            <div className="form-group">
              <label className="text-sm text-blue-900 font-medium" htmlFor="teacher-name">Nom complet</label>
              <input
                id="teacher-name"
                className="form-control"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="text-sm text-blue-900 font-medium" htmlFor="teacher-email">Email</label>
              <input
                id="teacher-email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="text-sm text-blue-900 font-medium" htmlFor="teacher-phone">Téléphone</label>
              <input
                id="teacher-phone"
                className="form-control"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="text-sm text-blue-900 font-medium" htmlFor="teacher-dept">Département</label>
              <select
                id="teacher-dept"
                className="form-control"
                value={form.department}
                onChange={e =>
                  setForm({ ...form, department: e.target.value })
                }
                required
              >
                <option value="">-- Sélectionner --</option>
                {departments.map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-sm text-blue-900 font-medium" htmlFor="teacher-exp">Expérience (ans)</label>
              <input
                id="teacher-exp"
                type="number"
                className="form-control"
                value={form.experience}
                onChange={e =>
                  setForm({ ...form, experience: parseInt(e.target.value, 10) || 0 })
                }
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
            >
              Ajouter
            </Button>
          </form>
        </Card>

        <Card className="border-0 shadow-lg md:col-span-2">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg text-blue-900">Liste des enseignants</h2>
            <select
              id="teacher-filter"
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="form-control md:w-64"
            >
              <option value="">Tous les départements</option>
              {departments.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <div className="overflow-y-auto max-h-96 border border-blue-100 rounded-xl">
              <table className="table">
                <thead className="sticky top-0">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Département</th>
                    <th>Expérience</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map(teacher => (
                    <tr key={teacher.id}>
                      <td className="font-semibold">{teacher.name}</td>
                      <td className="text-xs">{teacher.email}</td>
                      <td className="text-xs">{teacher.department}</td>
                      <td className="text-xs">{teacher.experience} ans</td>
                      <td className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          onClick={() => handleDelete(teacher.id)}
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
