import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { SidebarTeacher } from '../../components/teacher/SidebarTeacher';
import { MobileSidebarTeacher } from '../../components/teacher/MobileSidebarTeacher';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const DashboardTeacher = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <SidebarTeacher isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebarTeacher isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Enseignant
              </span>
            </div>
            <p className="text-gray-600">Bienvenue dans votre espace enseignant</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mes Classes */}
            <div className="lg:col-span-2">
              <Card title="Mes Classes" className="border-0 shadow-lg mb-6">
                {myClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucune classe assignée</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myClasses.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <h3 className="text-xl font-bold mb-2">{classItem.name}</h3>
                        <p className="text-blue-100">{classItem.studentsCount} élèves</p>
                        <Button
                          variant="primary"
                          className="mt-4 w-full"
                          style={{ backgroundColor: '#fbbf24' }}
                        >
                          Voir la classe
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Actions Rapides" className="border-0 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-6 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors border-2 border-transparent hover:border-yellow-300 text-left">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">📝</span>
                      <div>
                        <p className="font-semibold text-gray-900">Saisir les notes</p>
                        <p className="text-sm text-gray-600">Enregistrer les évaluations</p>
                      </div>
                    </div>
                  </button>
                  <button className="p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border-2 border-transparent hover:border-blue-300 text-left">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">✓</span>
                      <div>
                        <p className="font-semibold text-gray-900">Présences</p>
                        <p className="text-sm text-gray-600">Marquer les présences</p>
                      </div>
                    </div>
                  </button>
                </div>
              </Card>
            </div>

            {/* Emploi du Temps Aujourd'hui */}
            <div>
              <Card title="Aujourd'hui" className="border-0 shadow-lg">
                <div className="space-y-3">
                  {todaySchedule.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{item.time}</p>
                      <p className="font-semibold text-gray-900">{item.subject}</p>
                      <p className="text-sm text-gray-600">{item.class}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

