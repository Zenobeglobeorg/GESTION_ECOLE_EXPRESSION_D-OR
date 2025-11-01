import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { LoginPage } from './pages/public/LoginPage';
import { DashboardSuperAdmin } from './pages/superadmin/DashboardSuperAdmin';
import { AdminAccountsPage } from './pages/superadmin/AdminAccountsPage';
import { UsersManagementPage } from './pages/superadmin/UsersManagementPage';
import { RolesPermissionsPage } from './pages/superadmin/RolesPermissionsPage';
import { useAuth } from './hooks/useAuth';

// Composant pour rediriger selon le rôle (doit être à l'intérieur du contexte)
const DashboardRoute = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

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
          
          <Route
            path="/superadmin/admins"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminAccountsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/superadmin/users"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <UsersManagementPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/superadmin/roles"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <RolesPermissionsPage />
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
