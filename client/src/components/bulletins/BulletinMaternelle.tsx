import React from 'react';

interface CompetencyData {
  domain: string;
  competency: string;
  cb: number; // 1 ou 2
  activities: string[];
  paliers: {
    [key: number]: 'A' | 'B' | 'C' | 'D' | null; // Palier 1-6
  };
}

interface GeneralAttitude {
  label: string;
  options: {
    label: string;
    checked: boolean;
  }[];
}

interface BulletinMaternelleProps {
  studentName: string;
  studentFirstName: string;
  className: string;
  academicYear: string;
  competencies: CompetencyData[];
  generalAttitudes: GeneralAttitude[];
  remediations?: {
    teacherAdvice?: string;
    socialService?: boolean;
    psychologist?: boolean;
    speechTherapist?: boolean;
    ophthalmologist?: boolean;
    dentist?: boolean;
  };
  signatures?: {
    parent?: string;
    teacher?: string;
    director?: string;
  };
}

export const BulletinMaternelle: React.FC<BulletinMaternelleProps> = ({
  studentName,
  studentFirstName,
  className,
  academicYear,
  competencies,
  generalAttitudes,
  remediations,
  signatures,
}) => {
  const getPalierClass = (value: 'A' | 'B' | 'C' | 'D' | null, palier: number) => {
    if (!value) return 'bg-white border border-gray-300';
    const colors = {
      A: 'bg-green-200 border-2 border-green-500',
      B: 'bg-blue-200 border-2 border-blue-500',
      C: 'bg-yellow-200 border-2 border-yellow-500',
      D: 'bg-red-200 border-2 border-red-500',
    };
    return colors[value];
  };

  return (
    <div className="bulletin-maternelle">
      <style>{`
        @media print {
          .bulletin-maternelle {
            page-break-inside: avoid;
          }
          .no-print {
            display: none;
          }
        }
        @page {
          size: A4 portrait;
          margin: 1cm;
        }
      `}</style>

      <div className="bg-white p-6 min-h-screen">
        {/* En-tête */}
        <div className="text-center mb-4 border-b-2 border-pink-500 pb-3">
          <h1 className="text-xl font-bold text-gray-900">ÉVALUATION FORMATIVE</h1>
          <h2 className="text-lg font-semibold text-gray-800">NIVEAU DE MAÎTRISE DES CB</h2>
          <p className="text-sm text-gray-600 mt-1">
            {studentFirstName} {studentName} - {className} - {academicYear}
          </p>
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          {/* Partie gauche - Compétences */}
          <div className="border-2 border-gray-400 rounded-lg overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-pink-100">
                  <th className="border border-gray-400 p-2 text-left font-bold">Domaines</th>
                  <th className="border border-gray-400 p-2 text-left font-bold">Compétences</th>
                  <th className="border border-gray-400 p-2 text-center font-bold">CB</th>
                  {[1, 2, 3, 4, 5, 6].map((palier) => (
                    <th key={palier} className="border border-gray-400 p-1 text-center font-bold" colSpan={4}>
                      Palier {palier}
                    </th>
                  ))}
                </tr>
                <tr className="bg-pink-50">
                  <th colSpan={3} className="border border-gray-400"></th>
                  {[1, 2, 3, 4, 5, 6].map((palier) => (
                    <React.Fragment key={palier}>
                      <th className="border border-gray-400 p-1 text-center text-[10px]">A</th>
                      <th className="border border-gray-400 p-1 text-center text-[10px]">B</th>
                      <th className="border border-gray-400 p-1 text-center text-[10px]">C</th>
                      <th className="border border-gray-400 p-1 text-center text-[10px]">D</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competencies.map((comp, idx) => (
                  <React.Fragment key={idx}>
                    {comp.activities.map((activity, actIdx) => (
                      <tr key={`${idx}-${actIdx}`} className={actIdx === 0 ? 'bg-gray-50' : ''}>
                        {actIdx === 0 && (
                          <>
                            <td className="border border-gray-400 p-2 font-semibold" rowSpan={comp.activities.length}>
                              {comp.domain}
                            </td>
                            <td className="border border-gray-400 p-2 font-semibold" rowSpan={comp.activities.length}>
                              {comp.competency}
                            </td>
                            <td className="border border-gray-400 p-2 text-center font-bold" rowSpan={comp.activities.length}>
                              CB{comp.cb}
                            </td>
                          </>
                        )}
                        <td className="border border-gray-400 p-1 text-[10px]">{activity}</td>
                        {[1, 2, 3, 4, 5, 6].map((palier) => {
                          const value = comp.paliers[palier];
                          return (
                            <React.Fragment key={palier}>
                              <td className={`border border-gray-400 p-1 text-center ${getPalierClass(value, palier)}`}>
                                {value === 'A' ? '✓' : ''}
                              </td>
                              <td className={`border border-gray-400 p-1 text-center ${getPalierClass(value, palier)}`}>
                                {value === 'B' ? '✓' : ''}
                              </td>
                              <td className={`border border-gray-400 p-1 text-center ${getPalierClass(value, palier)}`}>
                                {value === 'C' ? '✓' : ''}
                              </td>
                              <td className={`border border-gray-400 p-1 text-center ${getPalierClass(value, palier)}`}>
                                {value === 'D' ? '✓' : ''}
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Partie droite - Attitudes Générales */}
          <div className="border-2 border-gray-400 rounded-lg p-4">
            <h3 className="font-bold text-lg text-center mb-4 border-b-2 border-gray-400 pb-2">
              ATTITUDES GÉNÉRALES
            </h3>
            <div className="space-y-3 text-xs">
              {generalAttitudes.map((attitude, idx) => (
                <div key={idx} className="border-b border-gray-300 pb-2">
                  <p className="font-semibold mb-1">{attitude.label}:</p>
                  <div className="space-y-1">
                    {attitude.options.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.checked}
                          readOnly
                          className="w-3 h-3"
                        />
                        <span className={option.checked ? 'font-semibold' : ''}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Remédiations et Signatures */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="border-2 border-gray-400 rounded-lg p-4">
            <h3 className="font-bold text-center mb-3 border-b border-gray-400 pb-2">
              REMÉDIATIONS PROPOSÉES
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-semibold mb-1">Avis et conseils de l'enseignant(e):</p>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 text-xs"
                  rows={3}
                  readOnly
                  value={remediations?.teacherAdvice || ''}
                />
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={remediations?.socialService} readOnly className="w-3 h-3" />
                  <span>Orienter vers le service social</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={remediations?.psychologist} readOnly className="w-3 h-3" />
                  <span>Orienter vers le psychologue</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={remediations?.speechTherapist} readOnly className="w-3 h-3" />
                  <span>Orienter vers l'orthophoniste</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={remediations?.ophthalmologist} readOnly className="w-3 h-3" />
                  <span>Orienter vers l'ophtalmologue</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={remediations?.dentist} readOnly className="w-3 h-3" />
                  <span>Orienter vers le dentiste</span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-400 rounded-lg p-4">
            <h3 className="font-bold text-center mb-4 border-b border-gray-400 pb-2">
              SIGNATURES
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-semibold mb-2">Signature du parent:</p>
                <div className="border-b-2 border-gray-400 h-12"></div>
                <p className="text-gray-600 mt-1">{signatures?.parent || ''}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Signature de l'enseignant(e):</p>
                <div className="border-b-2 border-gray-400 h-12"></div>
                <p className="text-gray-600 mt-1">{signatures?.teacher || ''}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Signature du(de la) Directeur(trice):</p>
                <div className="border-b-2 border-gray-400 h-12"></div>
                <p className="text-gray-600 mt-1">{signatures?.director || ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};






