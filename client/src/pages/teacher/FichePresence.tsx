//import React from "react"; // pour eviter les warnings
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function FichePresence() {
  return (
    <TeacherLayout title="Fiche de Présence" subtitle="Consulter les statistiques de présence">
      <div className="space-y-6">
        {/* Cartes de présence récente */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">Présence Récemment Recensée</h3>
            <span className="text-white/80">▼</span>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold shadow-lg">
                <span className="text-2xl">30/50</span>
                <span className="text-sm mt-1">CM2 A</span>
              </div>
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900 font-bold shadow-lg">
                <span className="text-2xl">30/50</span>
                <span className="text-sm mt-1">SIL A</span>
              </div>
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold shadow-lg">
                <span className="text-2xl">30/50</span>
                <span className="text-sm mt-1">CP A</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 flex items-center justify-between">
            <h3 className="text-blue-900 font-semibold text-lg">Présence Récemment Recensée</h3>
            <span className="text-blue-900/80">▼</span>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold shadow-lg">
                <span className="text-2xl">30/50</span>
                <span className="text-sm mt-1">CM2 A</span>
              </div>
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900 font-bold shadow-lg">
                <span className="text-2xl">30/50</span>
                <span className="text-sm mt-1">SIL A</span>
              </div>
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold shadow-lg">
                <span className="text-2xl">30/50</span>
                <span className="text-sm mt-1">CP A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-300 p-6">
          <h3 className="text-center text-xl font-bold text-blue-900 mb-6">Statistique Globale</h3>
          <div className="flex justify-around">
            <div className="flex flex-col items-center px-6 py-4 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900 font-bold min-w-[120px] shadow-md">
              <span className="text-3xl">75%</span>
              <span className="text-base mt-2">Présence</span>
            </div>
            <div className="flex flex-col items-center px-6 py-4 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold min-w-[120px] shadow-md">
              <span className="text-3xl">25%</span>
              <span className="text-base mt-2">Absence</span>
            </div>
          </div>
        </div>

        {/* Bouton Faire l'Appel */}
        <div className="flex justify-center">
          <Link to="/teacher/Presence">
            <Button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all">
              Faire l'Appel
            </Button>
          </Link>
        </div>
      </div>
    </TeacherLayout>
  );
}
