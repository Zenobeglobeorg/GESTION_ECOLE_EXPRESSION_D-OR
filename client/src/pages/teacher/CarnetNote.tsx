//import React from "react"; // pour eviter les warnings
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export function CarnetNote() {
  const recentActivities = [
    { text: "Note de la classe de CM2 remplit", time: "il y'a 2 semaines" },
    { text: "Note de la classe de CP remplit", time: "il y'a 2 semaines" },
    { text: "Note de la classe de SIL remplit", time: "il y'a 2 semaines" },
    { text: "Note de la classe de CE1 remplit", time: "il y'a 2 semaines" },
  ];

  return (
    <TeacherLayout title="Carnet de Note" subtitle="Gérer vos notes et évaluations">
      <div className="space-y-6">
        {/* Activités récentes */}
        <Card className="border-0 shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-white font-bold text-lg uppercase tracking-wide text-center">
              ACTIVITÉS RÉCENTES
            </h3>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-blue-100">
              {recentActivities.map((activity, index) => (
                <li key={index} className="px-6 py-4 hover:bg-blue-50 transition-colors">
                  <div className="flex flex-col gap-2">
                    <span className="text-blue-900 font-medium">{activity.text}</span>
                    <small className="text-blue-600 text-sm">{activity.time}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/teacher/RemplitNote" className="group">
            <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 hover:from-yellow-200 hover:to-yellow-100 transition-all border-2 border-transparent hover:border-yellow-300 cursor-pointer shadow-md">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-3xl text-blue-900 font-bold shadow-lg group-hover:scale-110 transition-transform">
                ＋
              </div>
              <span className="text-blue-900 font-semibold text-lg">Ajouter Note</span>
            </div>
          </Link>

          <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 transition-all border-2 border-transparent hover:border-blue-300 cursor-pointer shadow-md">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
              🖊
            </div>
            <span className="text-blue-900 font-semibold text-lg">Modifier Note</span>
          </div>

          <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 transition-all border-2 border-transparent hover:border-green-300 cursor-pointer shadow-md">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
              📘
            </div>
            <span className="text-blue-900 font-semibold text-lg">Historique</span>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
