import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";

interface Parent {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  children: string[];
  notificationEmail: boolean;
  notificationSMS: boolean;
}

export const UsersParents = () => {
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 1,
      name: "Ahmed Ali",
      email: "ali.ahmed@email.com",
      phone: "06 12 34 56 78",
      address: "123 Rue de l'École",
      children: ["Ahmed Jr", "Amira"],
      notificationEmail: true,
      notificationSMS: false,
    },
    {
      id: 2,
      name: "Fatima Hassan",
      email: "hassan.fatima@email.com",
      phone: "06 98 76 54 32",
      address: "456 Avenue du Savoir",
      children: ["Hassan Jr"],
      notificationEmail: true,
      notificationSMS: true,
    },
  ]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    children: [] as string[],
    notificationEmail: true,
    notificationSMS: false,
  });
  const [filterName, setFilterName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/parents`,
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
      const newParent: Parent = { id: parents.length + 1, ...form, children: [] };
      setParents([...parents, newParent]);
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        children: [],
        notificationEmail: true,
        notificationSMS: false,
      });
      alert("Parent créé avec succès");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleDelete = (id: number) => {
    setParents(parents.filter(p => p.id !== id));
  };

  const filteredParents = parents.filter(
    p =>
      p.name.toLowerCase().includes(filterName.toLowerCase()) ||
      p.email.includes(filterName)
  );

  return (
    <AdminLayout
      title="Gestion des Parents"
      subtitle="Créez des comptes familles et maintenez leurs informations à jour."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-lg text-blue-900">Ajouter un parent</h2>

            <div className="form-group">
              <label className="text-sm text-blue-900 font-medium">Nom complet</label>
              <input
                className="form-control"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="text-sm text-blue-900 font-medium">Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="text-sm text-blue-900 font-medium">Téléphone</label>
              <input
                className="form-control"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="text-sm text-blue-900 font-medium">Adresse</label>
              <input
                className="form-control"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm text-blue-900">
                <input
                  type="checkbox"
                  checked={form.notificationEmail}
                  onChange={e =>
                    setForm({
                      ...form,
                      notificationEmail: e.target.checked,
                    })
                  }
                />
                Notifications email
              </label>
              <label className="flex items-center gap-3 text-sm text-blue-900">
                <input
                  type="checkbox"
                  checked={form.notificationSMS}
                  onChange={e =>
                    setForm({
                      ...form,
                      notificationSMS: e.target.checked,
                    })
                  }
                />
                Notifications SMS
              </label>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500"
            >
              Ajouter
            </Button>
          </form>
        </Card>

        <Card className="border-0 shadow-lg lg:col-span-2">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="font-semibold text-lg text-blue-900">Liste des parents</h2>
              <input
                type="text"
                placeholder="Filtrer par nom ou email..."
                className="form-control md:w-64"
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
              />
            </div>

            <div className="overflow-y-auto max-h-96 border border-blue-100 rounded-xl">
              <table className="table">
                <thead className="sticky top-0">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Enfants</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.map(parent => (
                    <tr key={parent.id}>
                      <td className="font-semibold">{parent.name}</td>
                      <td className="text-xs">{parent.email}</td>
                      <td className="text-xs">{parent.phone}</td>
                      <td className="text-xs">{parent.children.length}</td>
                      <td className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          onClick={() => handleDelete(parent.id)}
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
