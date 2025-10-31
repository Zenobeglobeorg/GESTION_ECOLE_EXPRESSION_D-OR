import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { LoginPage } from './pages/public/LoginPage';
import { DashboardSuperAdmin } from './pages/superadmin/DashboardSuperAdmin';
import { useAuth } from './hooks/useAuth';

// Composant pour rediriger selon le rôle
const DashboardRoute = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  switch (user.role) {
    case 'SUPER_ADMIN':
      return <Navigate to="/superadmin" replace />;
    case 'ADMINISTRATION':
      return <div>Dashboard Admin (à implémenter)</div>;
    case 'TEACHER':
      return <div>Dashboard Enseignant (à implémenter)</div>;
    case 'PARENT':
      return <div>Dashboard Parent (à implémenter)</div>;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRoute />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <DashboardSuperAdmin />
              </ProtectedRoute>
            }
          />

          {/* Route par défaut */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
