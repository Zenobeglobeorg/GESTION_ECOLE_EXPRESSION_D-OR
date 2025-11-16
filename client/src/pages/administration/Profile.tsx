import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";

export const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "Système",
    email: "admin@ecole.fr",
    phone: "01 23 45 67 89",
    department: "Administration",
    bio: "Administrateur système",
  });
  const [section, setSection] = useState("personal");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profil mis à jour");
  };

  return (
    <AdminLayout
      title="Profil administrateur"
      subtitle="Mettez à jour vos informations personnelles et vos préférences."
    >
      <div className="max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Card className="border-0 shadow-lg">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                {profile.firstName.charAt(0)}
                {profile.lastName.charAt(0)}
              </div>
              <h2 className="font-semibold text-blue-900">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-xs text-blue-700/70">{profile.department}</p>
            </div>
          </Card>
          <div className="space-y-2">
            {[
              { id: "personal", label: "Informations" },
              { id: "security", label: "Sécurité" },
              { id: "preferences", label: "Préférences" },
            ].map(tab => (
              <Button
                key={tab.id}
                type="button"
                variant="outline"
                className={`w-full justify-start border-2 ${
                  section === tab.id
                    ? "border-yellow-400 text-blue-900 bg-yellow-100"
                    : "border-blue-100 text-blue-700 hover:bg-blue-50"
                }`}
                onClick={() => setSection(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          {section === "personal" && (
            <Card className="border-0 shadow-lg">
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <h2 className="font-semibold text-lg text-blue-900">Informations personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="text-sm font-medium text-blue-900" htmlFor="profile-first-name">Prénom</label>
                    <input
                      id="profile-first-name"
                      className="form-control"
                      value={profile.firstName}
                      onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-blue-900" htmlFor="profile-last-name">Nom</label>
                    <input
                      id="profile-last-name"
                      className="form-control"
                      value={profile.lastName}
                      onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    className="form-control"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="text-sm font-medium text-blue-900" htmlFor="profile-phone">Téléphone</label>
                    <input
                      id="profile-phone"
                      className="form-control"
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-blue-900" htmlFor="profile-dept">Département</label>
                    <input
                      id="profile-dept"
                      className="form-control"
                      value={profile.department}
                      onChange={e => setProfile({ ...profile, department: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                  Enregistrer
                </Button>
              </form>
            </Card>
          )}

          {section === "security" && (
            <Card className="border-0 shadow-lg">
              <div className="p-6 space-y-4">
                <h2 className="font-semibold text-lg text-blue-900">Sécurité</h2>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="old-password">Ancien mot de passe</label>
                  <input type="password" id="old-password" className="form-control" />
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="new-password">Nouveau mot de passe</label>
                  <input type="password" id="new-password" className="form-control" />
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="confirm-password">Confirmer</label>
                  <input type="password" id="confirm-password" className="form-control" />
                </div>
                <Button className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                  Modifier le mot de passe
                </Button>
              </div>
            </Card>
          )}

          {section === "preferences" && (
            <Card className="border-0 shadow-lg">
              <div className="p-6 space-y-4">
                <h2 className="font-semibold text-lg text-blue-900">Préférences</h2>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="pref-lang">Langue de l'interface</label>
                  <select id="pref-lang" className="form-control" defaultValue="fr">
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="pref-theme">Thème</label>
                  <select id="pref-theme" className="form-control" defaultValue="light">
                    <option value="light">Clair (par défaut)</option>
                    <option value="dark">Sombre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900">Notifications email</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm text-blue-700/80">Recevoir un résumé hebdomadaire</span>
                  </div>
                </div>
                <Button className="bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                  Sauvegarder les préférences
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
