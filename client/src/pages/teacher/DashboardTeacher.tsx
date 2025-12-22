import { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import * as dashboardService from '../../services/dashboardService';
import * as classService from '../../services/classService';
import * as scheduleService from '../../services/scheduleService';

export const DashboardTeacher = () => {
  const { t } = useLanguage();
  const [myClasses, setMyClasses] = useState<classService.Class[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Array<{
    time: string;
    subject: string;
    class: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les classes et l'emploi du temps en parallèle
        const [classesData, schedulesData] = await Promise.all([
          classService.getMyClasses(),
          scheduleService.getSchedules(),
        ]);

        setMyClasses(classesData);

        // Filtrer l'emploi du temps pour aujourd'hui
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
        // Convertir en format backend (1 = Lundi)
        const backendDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

        const todaySchedules = schedulesData
          .filter(schedule => {
            // Filtrer par jour de la semaine
            if (schedule.dayOfWeek !== backendDayOfWeek) return false;
            
            // Filtrer uniquement les matières (SUBJECT)
            if (schedule.type !== 'SUBJECT') return false;
            
            // Vérifier que c'est une classe de l'enseignant
            return classesData.some(c => c.id === schedule.classId);
          })
          .sort((a, b) => {
            // Trier par heure de début
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
          })
          .slice(0, 5) // Limiter à 5 cours
          .map(schedule => ({
            time: `${schedule.startTime} - ${schedule.endTime}`,
            subject: schedule.subject?.name || schedule.eventName || 'Sans matière',
            class: schedule.class?.name || '--',
          }));

        setTodaySchedule(todaySchedules);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <TeacherLayout
      title={t("teacher.dashboard") || "Tableau de Bord"}
      subtitle={t("teacher.welcome") || "Bienvenue dans votre espace enseignant"}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mes Classes */}
        <div className="lg:col-span-2">
          <Card title={t("teacher.myClasses") || "Mes Classes"} className="border-0 shadow-lg dark:bg-gray-800 mb-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">{t("common.loading") || "Chargement..."}</p>
              </div>
            ) : myClasses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{t("teacher.noClasses") || "Aucune classe assignée"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myClasses.map((classItem) => (
                  <Link
                    key={classItem.id}
                    to="/teacher/classes"
                    className="p-6 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow cursor-pointer dark:from-blue-700 dark:via-blue-600 dark:to-blue-700"
                  >
                    <h3 className="text-xl font-bold mb-2">{classItem.name}</h3>
                    <p className="text-blue-100">{classItem._count?.students || 0} {t("teacher.students") || "élèves"}</p>
                    <Button
                      variant="primary"
                      className="mt-4 w-full"
                      style={{ backgroundColor: '#fbbf24' }}
                    >
                      {t("teacher.viewClass") || "Voir la classe"}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card title={t("teacher.quickActions") || "Actions Rapides"} className="border-0 shadow-lg dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/teacher/RemplitNote" className="p-6 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/30 hover:from-yellow-200 hover:to-yellow-100 dark:hover:from-yellow-900/50 dark:hover:to-yellow-800/50 transition-all border-2 border-transparent hover:border-yellow-300 dark:border-yellow-700 text-left">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📝</span>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-400">{t("teacher.enterGrades") || "Saisir les notes"}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{t("teacher.saveEvaluations") || "Enregistrer les évaluations"}</p>
                  </div>
                </div>
              </Link>
              <Link to="/teacher/Presence" className="p-6 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 hover:from-blue-200 hover:to-blue-100 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 transition-all border-2 border-transparent hover:border-blue-300 dark:border-blue-700 text-left">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">✓</span>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-400">{t("teacher.attendance") || "Présences"}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{t("teacher.markAttendance") || "Marquer les présences"}</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        {/* Emploi du Temps Aujourd'hui */}
        <div>
          <Card title={t("teacher.today") || "Aujourd'hui"} className="border-0 shadow-lg dark:bg-gray-800">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">{t("common.loading") || "Chargement..."}</p>
              </div>
            ) : todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t("teacher.noScheduleToday") || "Aucun cours prévu aujourd'hui"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-yellow-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg border border-yellow-100 dark:border-gray-600">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">{item.time}</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-400">{item.subject}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{item.class}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
};

