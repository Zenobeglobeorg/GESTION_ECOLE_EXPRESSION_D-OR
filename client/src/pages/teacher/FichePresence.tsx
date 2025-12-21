import { useState, useEffect, useCallback } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import * as classService from '../../services/classService';
import * as attendanceService from '../../services/attendanceService';
import { useLanguage } from '../../contexts/LanguageContext';

interface ClassWithStats extends classService.Class {
  stats?: attendanceService.AttendanceStats;
  totalStudents?: number;
}

export default function FichePresence() {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<ClassWithStats[]>([]);
  const [globalStats, setGlobalStats] = useState<attendanceService.AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les classes de l'enseignant
      const classesData = await classService.getMyClasses();

      // Calculer les dates selon la période sélectionnée
      const today = new Date();
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (selectedPeriod === 'today') {
        startDate = today.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      } else if (selectedPeriod === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Dimanche de cette semaine
        startDate = weekStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      } else if (selectedPeriod === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      }

      // Charger les statistiques pour chaque classe
      const classesWithStats = await Promise.all(
        classesData.map(async (cls) => {
          try {
            const stats = await attendanceService.getAttendanceStats({
              classId: cls.id,
              startDate,
              endDate,
            });

            return {
              ...cls,
              stats,
              totalStudents: cls.students?.length || cls._count?.students || 0,
            };
          } catch (err) {
            console.error(`Error loading stats for class ${cls.id}:`, err);
            return {
              ...cls,
              stats: { present: 0, absent: 0, late: 0, total: 0 },
              totalStudents: cls.students?.length || cls._count?.students || 0,
            };
          }
        })
      );

      setClasses(classesWithStats);

      // Calculer les statistiques globales
      const global = classesWithStats.reduce(
        (acc, cls) => {
          if (cls.stats) {
            acc.present += cls.stats.present;
            acc.absent += cls.stats.absent;
            acc.late += cls.stats.late;
            acc.total += cls.stats.total;
          }
          return acc;
        },
        { present: 0, absent: 0, late: 0, total: 0 }
      );

      setGlobalStats(global);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Obtenir les classes avec présences récentes (pour aujourd'hui)
  const getRecentAttendanceClasses = () => {
    return classes
      .filter((cls) => cls.stats && cls.stats.total > 0)
      .sort((a, b) => {
        // Trier par date de dernière présence (on utilise le total comme indicateur)
        return (b.stats?.total || 0) - (a.stats?.total || 0);
      })
      .slice(0, 6); // Limiter à 6 classes
  };

  const recentClasses = getRecentAttendanceClasses();

  // Calculer le pourcentage de présence global
  const presencePercentage =
    globalStats.total > 0 ? Math.round((globalStats.present / globalStats.total) * 100) : 0;
  const absencePercentage =
    globalStats.total > 0 ? Math.round((globalStats.absent / globalStats.total) * 100) : 0;

  // Couleurs pour les cartes de classe
  const classColors = [
    { bg: 'from-blue-600 to-blue-700', text: 'text-white' },
    { bg: 'from-yellow-400 to-yellow-500', text: 'text-blue-900 dark:text-blue-900' },
    { bg: 'from-green-500 to-green-600', text: 'text-white' },
    { bg: 'from-purple-500 to-purple-600', text: 'text-white' },
    { bg: 'from-pink-500 to-pink-600', text: 'text-white' },
    { bg: 'from-indigo-500 to-indigo-600', text: 'text-white' },
  ];

  if (loading) {
    return (
      <TeacherLayout
        title={t('teacher.attendanceSheet') || 'Fiche de Présence'}
        subtitle={t('teacher.viewAttendanceStats') || 'Consulter les statistiques de présence'}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-600 dark:text-blue-400">{t('common.loading') || 'Chargement...'}</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout
        title={t('teacher.attendanceSheet') || 'Fiche de Présence'}
        subtitle={t('teacher.viewAttendanceStats') || 'Consulter les statistiques de présence'}
      >
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      title={t('teacher.attendanceSheet') || 'Fiche de Présence'}
      subtitle={t('teacher.viewAttendanceStats') || 'Consulter les statistiques de présence'}
    >
      <div className="space-y-6">
        {/* Sélecteur de période */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-blue-900 dark:text-blue-400">
              {t('teacher.period') || 'Période'}:
            </label>
            <select
              className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600 w-48"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'today' | 'week' | 'month')}
            >
              <option value="today">{t('teacher.today') || "Aujourd'hui"}</option>
              <option value="week">{t('teacher.thisWeek') || 'Cette semaine'}</option>
              <option value="month">{t('teacher.thisMonth') || 'Ce mois'}</option>
            </select>
          </div>
        </div>

        {/* Cartes de présence récente */}
        {recentClasses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">
                {t('teacher.recentAttendance') || 'Présence Récemment Recensée'}
              </h3>
              <span className="text-white/80">▼</span>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-4">
                {recentClasses.map((cls, index) => {
                  const color = classColors[index % classColors.length];
                  const presentCount = cls.stats?.present || 0;
                  const totalCount = cls.stats?.total || 0;
                  const totalStudents = cls.totalStudents || 0;
                  
                  return (
                    <div
                      key={cls.id}
                      className={`flex flex-col items-center justify-center w-24 h-24 rounded-full bg-linear-to-br ${color.bg} ${color.text} font-bold shadow-lg`}
                    >
                      <span className="text-2xl">
                        {presentCount}/{totalStudents > 0 ? totalStudents : totalCount}
                      </span>
                      <span className="text-sm mt-1">{cls.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Statistiques globales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-yellow-300 dark:border-yellow-600 p-6">
          <h3 className="text-center text-xl font-bold text-blue-900 dark:text-blue-400 mb-6">
            {t('teacher.globalStatistics') || 'Statistique Globale'}
          </h3>
          <div className="flex justify-around flex-wrap gap-4">
            <div className="flex flex-col items-center px-6 py-4 rounded-lg bg-linear-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 text-blue-900 dark:text-blue-900 font-bold min-w-[120px] shadow-md">
              <span className="text-3xl">{presencePercentage}%</span>
              <span className="text-base mt-2">{t('teacher.presence') || 'Présence'}</span>
              <span className="text-xs mt-1">
                ({globalStats.present}/{globalStats.total})
              </span>
            </div>
            <div className="flex flex-col items-center px-6 py-4 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-bold min-w-[120px] shadow-md">
              <span className="text-3xl">{absencePercentage}%</span>
              <span className="text-base mt-2">{t('teacher.absence') || 'Absence'}</span>
              <span className="text-xs mt-1">
                ({globalStats.absent}/{globalStats.total})
              </span>
            </div>
            {globalStats.late > 0 && (
              <div className="flex flex-col items-center px-6 py-4 rounded-lg bg-linear-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white font-bold min-w-[120px] shadow-md">
                <span className="text-3xl">{globalStats.late}</span>
                <span className="text-base mt-2">{t('teacher.late') || 'Retards'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Liste détaillée des classes */}
        {classes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-linear-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-blue-900 dark:text-blue-900 font-semibold text-lg">
                {t('teacher.detailedByClass') || 'Détails par Classe'}
              </h3>
              <span className="text-blue-900/80 dark:text-blue-900/80">▼</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls, index) => {
                  const color = classColors[index % classColors.length];
                  const presentCount = cls.stats?.present || 0;
                  const absentCount = cls.stats?.absent || 0;
                  const lateCount = cls.stats?.late || 0;
                  const totalCount = cls.stats?.total || 0;
                  const totalStudents = cls.totalStudents || 0;
                  const classPresencePercentage =
                    totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

                  return (
                    <div
                      key={cls.id}
                      className={`p-4 rounded-lg bg-linear-to-br ${color.bg} ${color.text} shadow-md`}
                    >
                      <h4 className="font-bold text-lg mb-2">{cls.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>{t('teacher.present') || 'Présents'}:</span>
                          <span className="font-semibold">{presentCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('teacher.absent') || 'Absents'}:</span>
                          <span className="font-semibold">{absentCount}</span>
                        </div>
                        {lateCount > 0 && (
                          <div className="flex justify-between">
                            <span>{t('teacher.late') || 'Retards'}:</span>
                            <span className="font-semibold">{lateCount}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-1 mt-1">
                          <span>{t('teacher.total') || 'Total'}:</span>
                          <span className="font-semibold">
                            {totalCount}/{totalStudents}
                          </span>
                        </div>
                        <div className="text-center mt-2 pt-2 border-t">
                          <span className="text-xs">
                            {classPresencePercentage}% {t('teacher.presence') || 'de présence'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {classes.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-100 dark:border-gray-700 p-6 text-center">
            <p className="text-blue-600 dark:text-blue-400">
              {t('teacher.noClassesAssigned') || 'Aucune classe assignée'}
            </p>
          </div>
        )}

        {/* Bouton Faire l'Appel */}
        <div className="flex justify-center">
          <Link to="/teacher/Presence">
            <Button className="px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-semibold text-lg rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 shadow-lg transition-all">
              {t('teacher.takeAttendance') || "Faire l'Appel"}
            </Button>
          </Link>
        </div>
      </div>
    </TeacherLayout>
  );
}
