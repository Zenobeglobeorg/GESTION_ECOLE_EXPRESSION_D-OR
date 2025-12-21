import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminThemeProvider } from './contexts/AdminThemeContext';
import './index.css'
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { DashboardSuperAdmin } from './pages/superadmin/DashboardSuperAdmin';
import { AdminAccountsPage } from './pages/superadmin/AdminAccountsPage';
import { UsersManagementPage } from './pages/superadmin/UsersManagementPage';
import { RolesPermissionsPage } from './pages/superadmin/RolesPermissionsPage';
import { OverviewPage } from './pages/superadmin/OverviewPage';
import { Profile as SuperAdminProfile } from './pages/superadmin/Profile';
import { Settings as SuperAdminSettings } from './pages/superadmin/Settings';
import { DashboardAdmin } from './pages/administration/DashboardAdmin';
import { StudentRegistrationPage } from './pages/administration/StudentRegistrationPage';
import { Students } from './pages/administration/Students';
import { EditStudentPage } from './pages/administration/EditStudentPage';
import { Classes } from './pages/administration/Classes';
import { Timetable } from './pages/administration/Timetable';
import { Evaluations } from './pages/administration/Evaluations';
import { Grades } from './pages/administration/Grades';
import { Bulletins } from './pages/administration/Bulletins';
import { Attendance } from './pages/administration/Attendance';
import { Announcements } from './pages/administration/Announcements';
import { Calendar } from './pages/administration/Calendar';
import { Fees } from './pages/administration/Fees';
import { Messages } from './pages/administration/Messages';
import { Notifications } from './pages/administration/Notifications';
import { Profile } from './pages/administration/Profile';
import { Replacements } from './pages/administration/Replacements';
import { Reports } from './pages/administration/Reports';
import { Settings } from './pages/administration/Settings';
import { StudentsAssociate } from './pages/administration/StudentsAssociate';
import { Users } from './pages/administration/Users';
import { UsersParents } from './pages/administration/UsersParents';
import { UsersTeachers } from './pages/administration/UsersTeachers';
import { UsersAdmins } from './pages/administration/UsersAdmins';
import { UsersPermissions } from './pages/administration/UsersPermissions';
import { StudentsImport } from './pages/administration/StudentsImport';
import { DashboardTeacher } from './pages/teacher/DashboardTeacher';
import { ParentLayout } from './components/parent/ParentLayout';
import { ParentDashboardHome } from './pages/parent/ParentDashboardHome';
import ProfilParentPage from './pages/parent/ProfilParentPage';
import EmploiDuTempsPage from './pages/parent/EmploiDuTempsPage';
import PresencesPage from './pages/parent/PresencesPage';
import FraisScolaritePage from './pages/parent/FraisScolaritePage';
import NotificationsPage from './pages/parent/NotificationsPage';
import SettingsPage from './pages/parent/SettingsPage';
import { Presence } from './pages/teacher/Presence';
import FichePresence from './pages/teacher/FichePresence';
import { CarnetNote } from './pages/teacher/CarnetNote';
import { CahierExo } from './pages/teacher/CahierExo';
import RemplitNote from './pages/teacher/RemplitNote';
import { MyClasses } from './pages/teacher/MyClasses';
import { Schedule } from './pages/teacher/Schedule';
import { Profile as TeacherProfile } from './pages/teacher/Profile';
import { Settings as TeacherSettings } from './pages/teacher/Settings';
import NotificationsPageTeacher from './pages/teacher/NotificationsPage';
//import { DashboardParent } from './pages/parent/DashboardParent';
import { useAuth } from './hooks/useAuth';
import NotesBulletinsPage from './pages/parent/NotesBulletinsPage';
import MessageParent from './pages/parent/MessageParent';

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
        <LanguageProvider>
          <AdminThemeProvider>
            <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          
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
            path="/superadmin/overview"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <OverviewPage />
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

          <Route
            path="/superadmin/profile"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/settings"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Routes Administration - Accessible aussi par SUPER_ADMIN pour consultation */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Students /></ProtectedRoute>} />
          <Route path="/admin/students/new" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><StudentRegistrationPage /></ProtectedRoute>} />
          <Route path="/admin/students/:id/edit" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><EditStudentPage /></ProtectedRoute>} />
          <Route path="/admin/students/associate" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><StudentsAssociate /></ProtectedRoute>} />
          <Route path="/admin/students/import" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><StudentsImport /></ProtectedRoute>} />
          <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Classes /></ProtectedRoute>} />
          <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Timetable /></ProtectedRoute>} />
          <Route path="/admin/evaluations" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Evaluations /></ProtectedRoute>} />
          <Route path="/admin/grades" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Grades /></ProtectedRoute>} />
          <Route path="/admin/bulletins" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Bulletins /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Attendance /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Announcements /></ProtectedRoute>} />
          <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Calendar /></ProtectedRoute>} />
          <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Fees /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Messages /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Notifications /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Profile /></ProtectedRoute>} />
          <Route path="/admin/replacements" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Replacements /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Reports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Settings /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><Users /></ProtectedRoute>} />
          <Route path="/admin/users/parents" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><UsersParents /></ProtectedRoute>} />
          <Route path="/admin/users/teachers" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><UsersTeachers /></ProtectedRoute>} />
          <Route path="/admin/users/admins" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><UsersAdmins /></ProtectedRoute>} />
          <Route path="/admin/users/permissions" element={<ProtectedRoute allowedRoles={['ADMINISTRATION', 'SUPER_ADMIN']}><UsersPermissions /></ProtectedRoute>} />

          {/* Routes Enseignant - Accessible aussi par SUPER_ADMIN pour consultation */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <DashboardTeacher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/Presence"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <Presence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/FichePresence"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <FichePresence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/CarnetNote"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <CarnetNote />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/CahierExo"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <CahierExo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/RemplitNote"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <RemplitNote />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <MyClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/schedule"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/profile"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <TeacherProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/settings"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <TeacherSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/notifications"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']}>
                <NotificationsPageTeacher />
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
            <Route path="messages" element={<MessageParent />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
          </AdminThemeProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
