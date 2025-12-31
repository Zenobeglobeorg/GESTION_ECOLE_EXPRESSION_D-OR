import { useEffect, useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import { BulletinGenerator } from '../../components/bulletins/BulletinGenerator';
import * as studentService from '../../services/studentService';
import * as classService from '../../services/classService';
import { useLanguage } from '../../contexts/LanguageContext';

export const Bulletins = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [students, setStudents] = useState<studentService.Student[]>([]);
  const [classes, setClasses] = useState<classService.Class[]>([]);
  
  // Filtres
  const [classFilter, setClassFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de bulletin
  const [isBulletinModalOpen, setIsBulletinModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    class?: {
      id: number;
      name: string;
      level: string;
    };
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsData, classesData] = await Promise.all([
        studentService.getStudents(),
        classService.getClasses(),
      ]);
      
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les élèves
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Filtre par classe
      if (classFilter !== null) {
        const studentClassId = student.classId ?? student.class?.id;
        if (studentClassId !== classFilter) {
          return false;
        }
      }

      // Filtre par recherche (nom ou prénom)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const firstName = student.firstName?.toLowerCase() ?? '';
        const lastName = student.lastName?.toLowerCase() ?? '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (
          !firstName.includes(query) &&
          !lastName.includes(query) &&
          !fullName.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [students, classFilter, searchQuery]);

  const handleGenerateBulletin = (student: studentService.Student) => {
    const studentClass = student.class || classes.find(c => c.id === student.classId);
    setSelectedStudent({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      class: studentClass ? {
        id: studentClass.id,
        name: studentClass.name,
        level: studentClass.level || '',
      } : undefined,
    });
    setIsBulletinModalOpen(true);
  };

  const handleCloseBulletin = () => {
    setIsBulletinModalOpen(false);
    setSelectedStudent(null);
  };

  const handlePrintBulletin = () => {
    window.print();
  };

  return (
    <AdminLayout
      title={t('bulletins.title') || 'Génération des Bulletins'}
      subtitle={t('bulletins.subtitle') || 'Générez et imprimez les bulletins scolaires des élèves'}
    >
      <ProtectedContent permission="reports.generate" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de générer des bulletins.
        </div>
      }>
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
        {/* Filtres */}
        <Card className="border-0 shadow-lg dark:bg-gray-800">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4">
              {t('bulletins.filters') || 'Filtres de recherche'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                  {t('bulletins.filterByClass') || 'Filtrer par classe'}
                </label>
                <select
                  title="Sélectionner une classe"
                  value={classFilter || ''}
                  onChange={(e) => setClassFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-blue-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-blue-900 dark:text-white"
                >
                  <option value="">{t('bulletins.allClasses') || 'Toutes les classes'}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.level ? `(${cls.level})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                  {t('bulletins.searchByName') || 'Rechercher par nom ou prénom'}
                </label>
                <Input
                  type="text"
                  placeholder={t('bulletins.searchPlaceholder') || 'Nom ou prénom...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Liste des élèves */}
        <Card className="border-0 shadow-lg dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400">
                {t('bulletins.studentsList') || 'Liste des élèves'}
              </h2>
              {filteredStudents.length > 0 && (
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {filteredStudents.length} {t('bulletins.student') || 'élève'}{filteredStudents.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-10 text-center text-blue-700 dark:text-blue-400">
                {t('common.loading') || 'Chargement...'}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-blue-900 dark:text-blue-400">
                <p className="font-semibold">{t('bulletins.noStudents') || 'Aucun élève trouvé'}</p>
                <p className="text-sm text-blue-700/70 dark:text-blue-300/70 mt-1">
                  {t('bulletins.noMatchCriteria') || 'Aucun élève ne correspond aux critères de recherche.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-blue-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                        {t('bulletins.student') || 'Élève'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                        {t('bulletins.class') || 'Classe'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                        {t('bulletins.level') || 'Niveau'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                        {t('bulletins.actions') || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-blue-100 dark:divide-gray-700">
                    {filteredStudents.map((student) => {
                      const studentClass = student.class || classes.find(c => c.id === student.classId);
                      return (
                        <tr key={student.id} className="hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-blue-900 dark:text-blue-400">
                              {student.firstName} {student.lastName}
                            </div>
                            {student.parent && (
                              <div className="text-xs text-blue-700/70 dark:text-blue-300/70">
                                {student.parent.firstName} {student.parent.lastName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {studentClass?.name || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-400">
                            {studentClass?.level || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <ProtectedContent permission="reports.generate">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateBulletin(student)}
                                className="border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 hover:border-yellow-500"
                              >
                                📄 {t('bulletins.generate') || 'Générer le bulletin'}
                              </Button>
                            </ProtectedContent>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal de génération de bulletin */}
      {isBulletinModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white dark:bg-gray-800 w-full max-w-7xl max-h-[90vh] overflow-auto m-4 rounded-lg shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('bulletins.bulletinOf') || 'Bulletin de'} {selectedStudent.firstName} {selectedStudent.lastName}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrintBulletin}
                  className="border-blue-300 dark:border-gray-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
                >
                  🖨️ {t('bulletins.print') || 'Imprimer'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseBulletin}
                  className="border-red-300 dark:border-gray-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  ✕ {t('common.close') || 'Fermer'}
                </Button>
              </div>
            </div>
            <div className="p-4">
              <BulletinGenerator
                student={selectedStudent}
                academicYear="2024-2025"
                onClose={handleCloseBulletin}
              />
            </div>
          </div>
        </div>
      )}
      </ProtectedContent>
    </AdminLayout>
  );
};




