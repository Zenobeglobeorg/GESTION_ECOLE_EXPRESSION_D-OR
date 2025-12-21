import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileSidebar } from '../../components/layout/MobileSidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import type { UserRole } from '../../contexts/AuthContext';
import * as userService from '../../services/userService';
import type { UserWithDate } from '../../services/userService';
import * as studentService from '../../services/studentService';
import { useLanguage } from '../../contexts/LanguageContext';

type ViewType = 'users' | 'students';

export const UsersManagementPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [viewType, setViewType] = useState<ViewType>('users');
  const [users, setUsers] = useState<UserWithDate[]>([]);
  const [students, setStudents] = useState<studentService.Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'ADMINISTRATION' as UserRole,
  });

  // Charger les données au montage et quand la vue change
  useEffect(() => {
    if (viewType === 'users') {
      loadUsers();
    } else {
      loadStudents();
    }
  }, [viewType]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getUsers();
      // Convertir les données en UserWithDate[] (assure que createdAt est présent)
      setUsers(data as UserWithDate[]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await studentService.getStudents();
      setStudents(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des élèves';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les utilisateurs par rôle
  const filteredUsers = selectedRole === 'ALL' 
    ? users 
    : users.filter(user => user.role === selectedRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await userService.createUser(formData);
      setIsCreateModalOpen(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'ADMINISTRATION',
      });
      await loadUsers(); // Recharger la liste
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur';
      setError(errorMessage);
      console.error('Erreur:', err);
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm(t('users.deleteConfirm'))) {
      try {
        setError(null);
        await userService.deleteUser(userId);
        await loadUsers(); // Recharger la liste
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
        setError(errorMessage);
        console.error('Erreur:', err);
      }
    }
  };

  const handleSuspend = async (userId: number) => {
    if (window.confirm(t('users.suspendConfirm'))) {
      // TODO: Implémenter la suspension (nécessite un champ isActive dans le modèle User)
      console.log('Suspendre utilisateur:', userId);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm(t('users.deleteStudentConfirm'))) {
      try {
        setError(null);
        await studentService.deleteStudent(studentId);
        await loadStudents(); // Recharger la liste
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
        setError(errorMessage);
        console.error('Erreur:', err);
      }
    }
  };

  const roles: { value: UserRole; label: string; color: string; bgColor: string }[] = [
    { value: 'ADMINISTRATION', label: t('users.administration'), color: 'text-blue-800', bgColor: 'bg-blue-100' },
    { value: 'TEACHER', label: t('users.teacher'), color: 'text-green-800', bgColor: 'bg-green-100' },
    { value: 'PARENT', label: t('users.parent'), color: 'text-purple-800', bgColor: 'bg-purple-100' },
  ];

  const getRoleBadge = (role: UserRole) => {
    const roleInfo = roles.find(r => r.value === role) || roles[0];
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleInfo.bgColor} ${roleInfo.color}`}>
        {roleInfo.label}
      </span>
    );
  };

  const roleStats: Record<UserRole | 'ALL', number> = {
    ALL: users.length,
    ADMINISTRATION: users.filter(u => u.role === 'ADMINISTRATION').length,
    TEACHER: users.filter(u => u.role === 'TEACHER').length,
    PARENT: users.filter(u => u.role === 'PARENT').length,
    SUPER_ADMIN: users.filter(u => u.role === 'SUPER_ADMIN').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('users.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('users.subtitle')}</p>
          </div>

          {/* Onglets Utilisateurs / Élèves */}
          <div className="mb-6 flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setViewType('users')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                viewType === 'users'
                  ? 'border-yellow-400 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('users.users')} ({users.length})
            </button>
            <button
              onClick={() => setViewType('students')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                viewType === 'students'
                  ? 'border-yellow-400 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('users.students')} ({students.length})
            </button>
          </div>

          {viewType === 'users' ? (
            <>
              {/* Statistiques par rôle */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div 
                  className="cursor-pointer"
                  onClick={() => setSelectedRole('ALL')}
                >
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('users.total')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{roleStats.ALL}</p>
                    </div>
                  </Card>
                </div>
                {roles.map((role) => (
                  <div
                    key={role.value}
                    className={`cursor-pointer ${selectedRole === role.value ? 'ring-2 ring-yellow-400 dark:ring-yellow-500 rounded-lg' : ''}`}
                    onClick={() => setSelectedRole(role.value)}
                  >
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all dark:bg-gray-800">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{role.label}s</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{roleStats[role.value]}</p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Barre de recherche et filtres */}
              <Card className="mb-6 border-0 shadow-lg dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2">
                      <Button
                        variant={selectedRole === 'ALL' ? 'primary' : 'outline'}
                        onClick={() => setSelectedRole('ALL')}
                        size="sm"
                        style={selectedRole === 'ALL' ? { backgroundColor: '#fbbf24' } : {}}
                      >
                        {t('users.total')}
                      </Button>
                    {roles.map((role) => (
                      <Button
                        key={role.value}
                        variant={selectedRole === role.value ? 'primary' : 'outline'}
                        onClick={() => setSelectedRole(role.value)}
                        size="sm"
                        style={selectedRole === role.value ? { backgroundColor: '#fbbf24' } : {}}
                      >
                        {role.label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ backgroundColor: '#fbbf24' }}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('users.newUser')}
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="mb-6 border-0 shadow-lg dark:bg-gray-800">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">{t('users.studentsList')}</p>
                <Button
                  onClick={() => navigate('/superadmin/students/new')}
                  style={{ backgroundColor: '#fbbf24' }}
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('users.newStudent')}
                </Button>
              </div>
            </Card>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Tableau des utilisateurs ou élèves */}
          <Card className="border-0 shadow-lg dark:bg-gray-800">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">{viewType === 'users' ? t('users.loadingUsers') : t('users.loadingStudents')}...</p>
              </div>
            ) : viewType === 'users' ? (
              filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {selectedRole === 'ALL' 
                      ? t('users.noUsers') 
                      : `${t('users.noUsersByRole')} ${roles.find(r => r.value === selectedRole)?.label.toLowerCase()} ${t('users.created')}`}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t('users.startCreating')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.user')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.email')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.role')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.creationDate')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold mr-3">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </div>
                              {user.phone && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              title={t('users.edit')}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                              title={t('users.suspend')}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              title={t('users.delete')}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )
            ) : (
              students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">{t('users.noStudents')}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t('users.startRegistering')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.student')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.birthDate')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.class')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.parent')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.enrollmentDate')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t('users.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-semibold mr-3">
                                {student.firstName.charAt(0)}
                                {student.lastName.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="flex gap-2 mt-1">
                                  {student.hasDisability && (
                                    <span className="text-xs text-orange-600 dark:text-orange-400">Handicap</span>
                                  )}
                                  {student.isOrphan && (
                                    <span className="text-xs text-red-600 dark:text-red-400">Orphelin</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                            {new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.class ? (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                                {student.class.name}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">{t('users.notAssigned')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {student.parent.firstName} {student.parent.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{student.parent.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(student.enrollmentDate).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                title={t('users.viewDetails')}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                title={t('users.edit')}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                title={t('users.delete')}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </Card>
        </div>
      </main>

      {/* Modal de création */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('users.createUser')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('users.firstName')}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label={t('users.lastName')}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label={t('users.email')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label={t('users.phone')}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.accountType')}</label>
            <select
              title="Type de Compte"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.role === 'ADMINISTRATION' && t('users.adminDesc')}
              {formData.role === 'TEACHER' && t('users.teacherDesc')}
              {formData.role === 'PARENT' && t('users.parentDesc')}
            </p>
          </div>

          <Input
            label={t('users.password')}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={8}
            helperText={t('users.passwordHelper')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {t('users.cancel')}
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: '#fbbf24' }}
            >
              {t('users.createAccount')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

