import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css'
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { LoginPage } from './pages/public/LoginPage';
import { DashboardSuperAdmin } from './pages/superadmin/DashboardSuperAdmin';
import { AdminAccountsPage } from './pages/superadmin/AdminAccountsPage';
import { UsersManagementPage } from './pages/superadmin/UsersManagementPage';
import { RolesPermissionsPage } from './pages/superadmin/RolesPermissionsPage';
import { DashboardAdmin } from './pages/administration/DashboardAdmin';
import { StudentRegistrationPage } from './pages/administration/StudentRegistrationPage';
import { DashboardTeacher } from './pages/teacher/DashboardTeacher';
import { ParentLayout } from './components/parent/ParentLayout';
import { ParentDashboardHome } from './pages/parent/ParentDashboardHome';
import ProfilParentPage from './pages/parent/ProfilParentPage';
import EmploiDuTempsPage from './pages/parent/EmploiDuTempsPage';
import PresencesPage from './pages/parent/PresencesPage';
import FraisScolaritePage from './pages/parent/FraisScolaritePage';
import NotificationsPage from './pages/parent/NotificationsPage';
import SettingsPage from './pages/parent/SettingsPage';
import { useAuth } from './hooks/useAuth';
import NotesBulletinsPage from './pages/parent/NotesBulletinsPage';

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
      return <Navigate to="/admin" replace />;
    case 'TEACHER':
      return <Navigate to="/teacher" replace />;
    case 'PARENT':
      return <Navigate to="/parent" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
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

          <Route
            path="/superadmin/students/new"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <StudentRegistrationPage />
              </ProtectedRoute>
            }
          />

          {/* Routes Administration */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRATION']}>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/new"
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRATION']}>
                <StudentRegistrationPage />
              </ProtectedRoute>
            }
          />

          {/* Routes Enseignant */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <DashboardTeacher />
              </ProtectedRoute>
            }
          />

          {/* Routes Parent */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ParentDashboardHome />} />
            <Route path="profile" element={<ProfilParentPage />} />
            <Route path="grades" element={<NotesBulletinsPage />} />
            <Route path="schedule" element={<EmploiDuTempsPage />} />
            <Route path="attendance" element={<PresencesPage />} />
            <Route path="fees" element={<FraisScolaritePage />} />
            <Route path="notification" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          {/* Route par défaut */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
         
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
