import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/public/LoginPage';

/**
 * Composant de routage basique (à remplacer par React Router plus tard)
 */
const AppRouter = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // TODO: Implémenter le routage basé sur le rôle de l'utilisateur
  // Pour l'instant, affichage basique
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          Bienvenue, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mb-4">
          Rôle: {user?.role}
        </p>
        <p className="text-sm text-gray-500">
          Les interfaces spécifiques par rôle seront implémentées prochainement.
        </p>
      </div>
    </div>
  );
};

/**
 * Composant principal de l'application
 */
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
