import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { SidebarAdmin } from '../../components/admin/SidebarAdmin';
import { MobileSidebarAdmin } from '../../components/admin/MobileSidebarAdmin';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const DashboardAdmin = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const stats = [
    {
      title: 'Élèves',
      value: '0',
      icon: '🎓',
      color: 'bg-blue-500',
      description: 'Élèves inscrits'
    },
    {
      title: 'Classes',
      value: '0',
      icon: '📚',
      color: 'bg-green-500',
      description: 'Classes actives'
    },
    {
      title: 'Enseignants',
      value: '0',
      icon: '👨‍🏫',
      color: 'bg-purple-500',
      description: 'Enseignants actifs'
    },
    {
      title: 'Frais en attente',
      value: '0',
      icon: '💰',
      color: 'bg-yellow-500',
      description: 'Paiements en attente'
    }
  ];

  const quickActions = [
    { label: 'Inscrire un élève', path: '/admin/students/new', icon: '➕' },
    { label: 'Gérer les classes', path: '/admin/classes', icon: '📚' },
    { label: 'Valider les notes', path: '/admin/grades', icon: '✅' },
    { label: 'Générer les bulletins', path: '/admin/reports', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarAdmin isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebarAdmin isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Administration
              </span>
            </div>
            <p className="text-gray-600">Bienvenue dans votre espace d'administration</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className={`overflow-hidden hover:shadow-xl transition-all border-0 bg-gradient-to-br ${stat.color}`}
              >
                <div className="p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-2xl">
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-white text-opacity-90 text-sm mb-1 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-white text-opacity-75">{stat.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Actions rapides */}
          <Card title="Actions Rapides" className="mb-8 border-0 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="p-6 rounded-xl bg-gray-50 hover:bg-yellow-50 transition-all border-2 border-transparent hover:border-yellow-300 text-left"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-3xl">{action.icon}</span>
                    <span className="font-semibold text-gray-900 text-center">{action.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Informations importantes */}
          <Card title="Informations Importantes" className="border-0 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Notes en attente de validation</p>
                  <p className="text-xs text-gray-600">Des notes ont été saisies et nécessitent votre validation</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

