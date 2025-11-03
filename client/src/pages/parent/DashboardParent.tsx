import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { SidebarParent } from '../../components/parent/SidebarParent';
import { MobileSidebarParent } from '../../components/parent/MobileSidebarParent';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const DashboardParent = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  // Simuler plusieurs enfants
  const children = [
    { id: 1, name: 'Aminata Diop', class: 'CM1 A', avatar: 'A' },
    { id: 2, name: 'Ibrahima Diop', class: 'CE2 B', avatar: 'I' }
  ];

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarParent isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebarParent isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace Parent</h1>
            <p className="text-gray-600">Suivez la scolarité de vos enfants</p>
          </div>

          {/* Sélection d'enfant */}
          {children.length > 1 && (
            <Card className="mb-6 border-0 shadow-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Sélectionner un enfant :</p>
              <div className="flex gap-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      selectedChildId === child.id || (selectedChildId === null && children[0].id === child.id)
                        ? 'bg-yellow-100 border-2 border-yellow-400'
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold">
                      {child.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{child.name}</p>
                      <p className="text-xs text-gray-600">{child.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Informations de l'enfant sélectionné */}
          {selectedChild && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedChild.name} - {selectedChild.class}
                </h2>
              </div>

              {/* Statistiques rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <div className="p-6 text-white">
                    <p className="text-sm text-white text-opacity-90 mb-1">Moyenne Générale</p>
                    <p className="text-3xl font-bold">--</p>
                    <p className="text-xs text-white text-opacity-75 mt-1">Palier en cours</p>
                  </div>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600">
                  <div className="p-6 text-white">
                    <p className="text-sm text-white text-opacity-90 mb-1">Présence</p>
                    <p className="text-3xl font-bold">--%</p>
                    <p className="text-xs text-white text-opacity-75 mt-1">Ce mois</p>
                  </div>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-500">
                  <div className="p-6 text-white">
                    <p className="text-sm text-white text-opacity-90 mb-1">Frais de scolarité</p>
                    <p className="text-3xl font-bold">--</p>
                    <p className="text-xs text-white text-opacity-75 mt-1">Statut</p>
                  </div>
                </Card>
              </div>

              {/* Actions rapides */}
              <Card title="Accès Rapide" className="mb-6 border-0 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border-2 border-transparent hover:border-blue-300">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-3xl">📊</span>
                      <span className="font-semibold text-gray-900 text-center">Notes & Bulletins</span>
                    </div>
                  </button>
                  <button className="p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors border-2 border-transparent hover:border-green-300">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-3xl">✓</span>
                      <span className="font-semibold text-gray-900 text-center">Présences</span>
                    </div>
                  </button>
                  <button className="p-6 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors border-2 border-transparent hover:border-yellow-300">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-3xl">📅</span>
                      <span className="font-semibold text-gray-900 text-center">Emploi du Temps</span>
                    </div>
                  </button>
                  <button className="p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors border-2 border-transparent hover:border-purple-300">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-3xl">💬</span>
                      <span className="font-semibold text-gray-900 text-center">Messages</span>
                    </div>
                  </button>
                </div>
              </Card>

              {/* Dernières activités */}
              <Card title="Dernières Activités" className="border-0 shadow-lg">
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Aucune activité récente</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

