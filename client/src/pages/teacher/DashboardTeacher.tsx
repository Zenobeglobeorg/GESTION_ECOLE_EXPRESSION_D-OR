import { useState } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export const DashboardTeacher = () => {
  const { t } = useLanguage();

  const myClasses = [
    { id: 1, name: 'CM1 A', studentsCount: 25 },
    { id: 2, name: 'CM2 B', studentsCount: 23 }
  ];

  const todaySchedule = [
    { time: '07:30 - 09:00', subject: 'Mathématiques', class: 'CM1 A' },
    { time: '09:15 - 10:45', subject: 'Français', class: 'CM1 A' },
    { time: '11:00 - 12:30', subject: 'Sciences', class: 'CM2 B' }
  ];

  return (
    <TeacherLayout
      title={t("teacher.dashboard") || "Tableau de Bord"}
      subtitle={t("teacher.welcome") || "Bienvenue dans votre espace enseignant"}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mes Classes */}
        <div className="lg:col-span-2">
          <Card title={t("teacher.myClasses") || "Mes Classes"} className="border-0 shadow-lg dark:bg-gray-800 mb-6">
            {myClasses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{t("teacher.noClasses") || "Aucune classe assignée"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="p-6 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow cursor-pointer dark:from-blue-700 dark:via-blue-600 dark:to-blue-700"
                  >
                    <h3 className="text-xl font-bold mb-2">{classItem.name}</h3>
                    <p className="text-blue-100">{classItem.studentsCount} {t("teacher.students") || "élèves"}</p>
                    <Button
                      variant="primary"
                      className="mt-4 w-full"
                      style={{ backgroundColor: '#fbbf24' }}
                    >
                      {t("teacher.viewClass") || "Voir la classe"}
                    </Button>
                  </div>
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
            <div className="space-y-3">
              {todaySchedule.map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-yellow-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg border border-yellow-100 dark:border-gray-600">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">{item.time}</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-400">{item.subject}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{item.class}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
};

