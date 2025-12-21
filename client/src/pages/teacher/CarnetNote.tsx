import { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { useLanguage } from '../../contexts/LanguageContext';
import * as gradeService from '../../services/gradeService';
import * as classService from '../../services/classService';

export function CarnetNote() {
  const { t } = useLanguage();
  const [recentGrades, setRecentGrades] = useState<Array<{ text: string; time: string; classId?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<classService.Class[]>([]);

  useEffect(() => {
    const loadRecentGrades = async () => {
      try {
        setLoading(true);
        
        // Charger les classes de l'enseignant
        const teacherClasses = await classService.getMyClasses();
        setClasses(teacherClasses);

        // Charger les notes récentes pour chaque classe
        const activities: Array<{ text: string; time: string; classId?: number }> = [];
        
        for (const cls of teacherClasses) {
          try {
            const grades = await gradeService.getGrades(cls.id);
            
            if (grades.length > 0) {
              // Trier par date de création (plus récentes en premier)
              const sortedGrades = grades.sort((a, b) => {
                const dateA = new Date(a.date || a.evaluation?.date || '').getTime();
                const dateB = new Date(b.date || b.evaluation?.date || '').getTime();
                return dateB - dateA;
              });

              // Prendre la note la plus récente
              const mostRecent = sortedGrades[0];
              const gradeDate = new Date(mostRecent.date || mostRecent.evaluation?.date || mostRecent.createdAt || '');
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - gradeDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              let timeAgo = '';
              if (diffDays === 0) {
                timeAgo = t("teacher.today") || "Aujourd'hui";
              } else if (diffDays === 1) {
                timeAgo = t("teacher.yesterday") || "Hier";
              } else if (diffDays < 7) {
                timeAgo = t("teacher.daysAgo", { days: diffDays }) || `Il y a ${diffDays} jours`;
              } else if (diffDays < 14) {
                timeAgo = t("teacher.oneWeekAgo") || "Il y a 1 semaine";
              } else {
                const weeks = Math.floor(diffDays / 7);
                timeAgo = t("teacher.weeksAgo", { weeks }) || `Il y a ${weeks} semaines`;
              }

              activities.push({
                text: t("teacher.gradeNoteClass", { className: cls.name }) || `Note de la classe ${cls.name} remplie`,
                time: timeAgo,
                classId: cls.id,
              });
            }
          } catch (err) {
            console.error(`Erreur lors du chargement des notes pour la classe ${cls.name}:`, err);
          }
        }

        // Si aucune note récente, utiliser des données par défaut
        if (activities.length === 0) {
          activities.push(
            { text: t("teacher.noRecentGrades") || "Aucune note récente", time: "" }
          );
        }

        setRecentGrades(activities.slice(0, 4)); // Limiter à 4 activités
      } catch (err) {
        console.error('Erreur lors du chargement des notes récentes:', err);
        setRecentGrades([
          { text: t("teacher.errorLoadingGrades") || "Erreur lors du chargement", time: "" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentGrades();
  }, [t]);

  return (
    <TeacherLayout title={t("teacher.gradeBook") || "Carnet de Note"} subtitle={t("teacher.manageGrades") || "Gérer vos notes et évaluations"}>
      <div className="space-y-6">
        {/* Activités récentes */}
        <Card className="border-0 shadow-lg dark:bg-gray-800">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4">
            <h3 className="text-white font-bold text-lg uppercase tracking-wide text-center">
              {t("teacher.recentActivities") || "ACTIVITÉS RÉCENTES"}
            </h3>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-blue-600 dark:text-blue-400">{t("common.loading") || "Chargement..."}</p>
              </div>
            ) : (
              <ul className="divide-y divide-blue-100 dark:divide-gray-700">
                {recentGrades.length > 0 ? (
                  recentGrades.map((activity, index) => (
                    <li key={index} className="px-6 py-4 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex flex-col gap-2">
                        <span className="text-blue-900 dark:text-blue-400 font-medium">{activity.text}</span>
                        {activity.time && (
                          <small className="text-blue-600 dark:text-blue-300 text-sm">{activity.time}</small>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-4">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      {t("teacher.noRecentActivities") || "Aucune activité récente"}
                    </p>
                  </li>
                )}
              </ul>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/teacher/RemplitNote" className="group">
            <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/30 hover:from-yellow-200 hover:to-yellow-100 dark:hover:from-yellow-900/50 dark:hover:to-yellow-800/50 transition-all border-2 border-transparent hover:border-yellow-300 dark:border-yellow-700 cursor-pointer shadow-md">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-700 flex items-center justify-center text-3xl text-blue-900 dark:text-blue-100 font-bold shadow-lg group-hover:scale-110 transition-transform">
                ＋
              </div>
              <span className="text-blue-900 dark:text-blue-400 font-semibold text-lg">{t("teacher.addGrade") || "Ajouter Note"}</span>
            </div>
          </Link>

          <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 hover:from-blue-200 hover:to-blue-100 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 transition-all border-2 border-transparent hover:border-blue-300 dark:border-blue-700 cursor-pointer shadow-md">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
              🖊
            </div>
            <span className="text-blue-900 dark:text-blue-400 font-semibold text-lg">{t("teacher.editGrade") || "Modifier Note"}</span>
          </div>

          <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 hover:from-green-200 hover:to-green-100 dark:hover:from-green-900/50 dark:hover:to-green-800/50 transition-all border-2 border-transparent hover:border-green-300 dark:border-green-700 cursor-pointer shadow-md">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
              📘
            </div>
            <span className="text-blue-900 dark:text-blue-400 font-semibold text-lg">{t("teacher.history") || "Historique"}</span>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
