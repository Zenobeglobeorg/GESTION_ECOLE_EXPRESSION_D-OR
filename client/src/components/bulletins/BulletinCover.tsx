import React from 'react';

interface BulletinCoverProps {
  studentName: string;
  studentFirstName: string;
  className: string;
  academicYear: string;
  teacherName?: string;
  directorName?: string;
}

export const BulletinCover: React.FC<BulletinCoverProps> = ({
  studentName,
  studentFirstName,
  className,
  academicYear,
  teacherName,
  directorName,
}) => {
  return (
    <div className="bulletin-cover page-break-after">
      <style>{`
        @media print {
          .bulletin-cover {
            page-break-after: always;
            page-break-inside: avoid;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-white p-8 flex flex-col">
        {/* En-tête Ministère */}
        <div className="text-center mb-8 border-b-2 border-red-600 pb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            MINISTÈRE DE L'ÉDUCATION NATIONALE
          </h1>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            DIRECTION D'ACADÉMIE PROVINCIALE DE L'ESTUAIRE
          </h2>
          <h3 className="text-base font-medium text-gray-700">
            CIRCONSCRIPTION SCOLAIRE DE L'ESTUAIRE
          </h3>
        </div>

        {/* Logo et Nom de l'école */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4 shadow-lg flex items-center justify-center">
            <img 
              src="/logo-expression-or.jpg" 
              alt="Logo Expression d'Or" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-green-600 mb-1">ÉCOLE PRIVÉE</p>
            <p className="text-2xl font-bold text-red-600">L'EXPRESSION D'OR</p>
          </div>
        </div>

        {/* Titre principal */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BULLETIN D'ÉVALUATION</h1>
          <p className="text-sm text-gray-600">Dirigée Par: {directorName || '________________'}</p>
        </div>

        {/* Informations élève */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900 min-w-[150px]">Niveau:</span>
              <span className="text-gray-700">{className}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900 min-w-[150px]">Nom(s) et Prénom(s) de l'élève:</span>
              <span className="text-gray-700">{studentFirstName} {studentName}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900 min-w-[150px]">Statut de l'élève:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-gray-700">Nouveau</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-gray-700">Redoublant</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900 min-w-[150px]">Nom de l'enseignant(e):</span>
              <span className="text-gray-700">{teacherName || '________________'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900 min-w-[150px]">Année Scolaire:</span>
              <span className="text-gray-700">{academicYear}</span>
            </div>
          </div>
        </div>

        {/* Légende des notes */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4 text-center">
              SITUATION DE RÉUSSITE DANS UNE COMPÉTENCE
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 border border-green-300 rounded p-3">
                <p className="font-semibold text-green-800 mb-1">Max</p>
                <p className="text-sm text-green-700">
                  Maîtrise maximale de la compétence (8 à 9 points en critères minimaux)
                </p>
              </div>
              <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                <p className="font-semibold text-yellow-800 mb-1">Min</p>
                <p className="text-sm text-yellow-700">
                  Maîtrise minimale de la compétence (5 à 7 points en critères minimaux)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4 text-center">
              SITUATION D'ÉCHEC DANS UNE COMPÉTENCE
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-100 border border-orange-300 rounded p-3">
                <p className="font-semibold text-orange-800 mb-1">Part</p>
                <p className="text-sm text-orange-700">
                  Maîtrise partielle de la compétence (3 à 4 points en critères minimaux)
                </p>
              </div>
              <div className="bg-red-100 border border-red-300 rounded p-3">
                <p className="font-semibold text-red-800 mb-1">N M</p>
                <p className="text-sm text-red-700">
                  Non maîtrise de la compétence (0 à 2 points en critères minimaux)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4 text-center">
              CONDITIONS DE PASSAGE EN CLASSE SUPÉRIEURE
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-semibold">•</span>
                <span>
                  Réussir à l'évaluation du profil de sortie ou avoir une maîtrise minimale dans trois paliers tout au long de l'année
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">•</span>
                <span>
                  Être en situation de réussite dans les 5 paliers
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold">•</span>
                <span>
                  Avoir un niveau de maîtrise partielle au profil puis avoir au moins une maîtrise minimale dans les paliers 4 et 5 et une maîtrise partielle au palier 3
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Note importante */}
        <div className="mt-8 text-center text-sm text-gray-600 max-w-2xl mx-auto">
          <p className="font-semibold mb-2">NB:</p>
          <p>
            Le bulletin doit être signé par l'enseignant(e), le directeur (trice) et le parent (tuteur) après chaque semaine d'intégration.
            Une semaine d'intégration marque la fin d'un palier. Un palier comprend six (6) semaines, soit cinq (5) semaines d'apprentissage et une (1) semaine d'intégration.
          </p>
        </div>
      </div>
    </div>
  );
};





