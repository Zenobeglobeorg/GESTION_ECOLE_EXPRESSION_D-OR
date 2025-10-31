import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const DashboardSuperAdmin = () => {
  const stats = [
    {
      title: 'Comptes Administration',
      value: '0',
      icon: '👥',
      color: 'bg-blue-500',
      description: 'Comptes créés'
    },
    {
      title: 'Enseignants',
      value: '0',
      icon: '👨‍🏫',
      color: 'bg-green-500',
      description: 'Enseignants actifs'
    },
    {
      title: 'Parents',
      value: '0',
      icon: '👨‍👩‍👧',
      color: 'bg-purple-500',
      description: 'Familles inscrites'
    },
    {
      title: 'Élèves',
      value: '0',
      icon: '🎓',
      color: 'bg-yellow-500',
      description: 'Élèves inscrits'
    }
  ];

  const quickActions = [
    { label: 'Gérer les comptes Admin', path: '/superadmin/admins', icon: '⚙️' },
    { label: 'Gérer les rôles', path: '/superadmin/roles', icon: '🔐' },
    { label: 'Vue globale du système', path: '/superadmin/overview', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de Bord - Super-Administrateur
          </h1>
          <p className="text-gray-600">
            Bienvenue dans votre espace de gestion complète du système
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`w-16 h-16 rounded-full ${stat.color} flex items-center justify-center text-3xl`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Actions rapides */}
        <Card title="Actions Rapides" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center justify-center gap-2"
                onClick={() => console.log('Navigate to:', action.path)}
              >
                <span className="text-3xl">{action.icon}</span>
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Sections principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gestion des comptes */}
          <Card title="Gestion des Comptes Administration">
            <p className="text-gray-600 mb-4">
              Créez et gérez les comptes des membres de l'administration (Directeur, Secrétaire, etc.)
            </p>
            <Button
              variant="primary"
              onClick={() => console.log('Navigate to admin management')}
            >
              Gérer les Comptes Admin
            </Button>
          </Card>

          {/* Rôles et Permissions */}
          <Card title="Rôles et Permissions">
            <p className="text-gray-600 mb-4">
              Définissez avec précision les droits d'accès de chaque membre de l'administration
            </p>
            <Button
              variant="primary"
              onClick={() => console.log('Navigate to roles')}
            >
              Gérer les Rôles
            </Button>
          </Card>

          {/* Vue Globale */}
          <Card title="Vue Globale du Système">
            <p className="text-gray-600 mb-4">
              Accédez à toutes les données et modules du système avec un contrôle total
            </p>
            <Button
              variant="primary"
              onClick={() => console.log('Navigate to overview')}
            >
              Accéder à la Vue Globale
            </Button>
          </Card>

          {/* Activités Récentes */}
          <Card title="Activités Récentes">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Aucune activité récente</p>
                  <p className="text-xs text-gray-500">Le système est prêt</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


