import React from 'react';

interface SubjectCompetency {
  subject: string;
  competency: string;
  competencyNumber: number; // C1, C2, etc.
  activities: string[]; // C1, C2, C3 sous-activités
}

interface PalierData {
  palier: number;
  criteria: {
    [subjectKey: string]: {
      [competencyKey: string]: {
        [activityKey: string]: {
          criterionGrade?: number; // Note du critère
          competencyGrade?: number; // Note de la compétence
          competencyMastery?: 'Max' | 'Min' | 'Part' | 'NM'; // Maîtrise de la compétence
          subjectMastery?: 'Max' | 'Min' | 'Part' | 'NM'; // Maîtrise de la matière
        };
      };
    };
  };
  edmFrenchMathMastery?: 'Max' | 'Min' | 'Part' | 'NM'; // Maîtrise du palier en EDM&EAS, Français et Mathématiques
}

interface ExitProfile {
  [subjectKey: string]: {
    [competencyKey: string]: {
      annualCompetencyGrade?: number;
      annualCompetencyMastery?: 'Max' | 'Min' | 'Part' | 'NM';
      annualSubjectMastery?: 'Max' | 'Min' | 'Part' | 'NM';
    };
  };
  edmFrenchMathAnnualMastery?: 'Max' | 'Min' | 'Part' | 'NM';
}

interface BulletinPrimaireProps {
  studentName: string;
  studentFirstName: string;
  className: string;
  academicYear: string;
  subjects: SubjectCompetency[];
  paliers: PalierData[];
  exitProfile: ExitProfile;
  signatures?: {
    parent?: string;
    teacher?: string;
    director?: string;
  };
  classDecision?: string;
}

export const BulletinPrimaire: React.FC<BulletinPrimaireProps> = ({
  studentName,
  studentFirstName,
  className,
  academicYear,
  subjects,
  paliers,
  exitProfile,
  signatures,
  classDecision,
}) => {
  const getMasteryColor = (mastery?: 'Max' | 'Min' | 'Part' | 'NM') => {
    if (!mastery) return 'bg-white';
    switch (mastery) {
      case 'Max': return 'bg-green-100 text-green-800';
      case 'Min': return 'bg-yellow-100 text-yellow-800';
      case 'Part': return 'bg-orange-100 text-orange-800';
      case 'NM': return 'bg-red-100 text-red-800';
      default: return 'bg-white';
    }
  };

  // Grouper les sujets par domaine
  const groupedSubjects: { [domain: string]: SubjectCompetency[] } = {};
  subjects.forEach((subject) => {
    const domain = subject.subject.split(' ')[0]; // EDM, Français, Mathématiques, Anglais
    if (!groupedSubjects[domain]) {
      groupedSubjects[domain] = [];
    }
    groupedSubjects[domain].push(subject);
  });

  // Calculer le nombre total de colonnes
  let totalCols = 1; // Colonne "Nom et Prénom" sticky
  Object.values(groupedSubjects).forEach((domainSubjects) => {
    domainSubjects.forEach((subject) => {
      totalCols += subject.activities.length; // Une colonne par activité
      totalCols += 1; // Colonne NM après chaque compétence
    });
  });

  return (
    <div className="bulletin-primaire">
      <style>{`
        @media print {
          .bulletin-primaire {
            page-break-inside: avoid;
          }
          .no-print {
            display: none;
          }
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
        }
        .sticky-col {
          position: sticky;
          left: 0;
          background: white;
          z-index: 10;
          box-shadow: 2px 0 4px rgba(0,0,0,0.1);
        }
        @media print {
          .sticky-col {
            position: relative;
            box-shadow: none;
          }
        }
      `}</style>

      <div className="bg-white p-4 min-h-screen">
        {/* En-tête */}
        <div className="text-center mb-4 border-b-2 border-blue-600 pb-2">
          <h1 className="text-xl font-bold text-gray-900">ÉVALUATION FORMATIVE - 5ᵉ année</h1>
          <p className="text-sm text-gray-600 mt-1">
            {studentFirstName} {studentName} - {className} - {academicYear}
          </p>
        </div>

        {/* Tableau principal */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-gray-400">
            <thead>
              {/* Ligne 1: Domaines */}
              <tr className="bg-blue-100">
                <th rowSpan={3} className="sticky-col border border-gray-400 p-2 font-bold text-center bg-blue-200">
                  Paliers
                </th>
                {Object.entries(groupedSubjects).map(([domain, domainSubjects]) => {
                  const colSpan = domainSubjects.reduce((sum, s) => sum + s.activities.length + 1, 0);
                  return (
                    <th key={domain} colSpan={colSpan} className="border border-gray-400 p-2 font-bold text-center">
                      {domain}
                    </th>
                  );
                })}
              </tr>
              
              {/* Ligne 2: Compétences */}
              <tr className="bg-blue-50">
                {Object.values(groupedSubjects).map((domainSubjects) =>
                  domainSubjects.map((subject) => {
                    const colSpan = subject.activities.length + 1; // Activités + NM
                    return (
                      <th key={`${subject.subject}-${subject.competencyNumber}`} colSpan={colSpan} className="border border-gray-400 p-1 font-semibold text-center">
                        {subject.competency}
                      </th>
                    );
                  })
                )}
              </tr>
              
              {/* Ligne 3: Activités et NM */}
              <tr className="bg-gray-50">
                {Object.values(groupedSubjects).map((domainSubjects) =>
                  domainSubjects.map((subject) => (
                    <React.Fragment key={`${subject.subject}-${subject.competencyNumber}-activities`}>
                      {subject.activities.map((activity, idx) => (
                        <th key={`${subject.subject}-${subject.competencyNumber}-${idx}`} className="border border-gray-400 p-1 text-[10px] text-center font-medium">
                          {activity}
                        </th>
                      ))}
                      <th className="border border-gray-400 p-1 text-[10px] text-center font-bold bg-yellow-100">
                        NM
                      </th>
                    </React.Fragment>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {/* Lignes pour chaque Palier */}
              {paliers.map((palierData) => (
                <React.Fragment key={palierData.palier}>
                  {/* Note du critère */}
                  <tr>
                    <td className="sticky-col border border-gray-400 p-1 font-semibold bg-gray-100">
                      Palier {palierData.palier} - Note du critère
                    </td>
                    {Object.values(groupedSubjects).map((domainSubjects) =>
                      domainSubjects.map((subject) => (
                        <React.Fragment key={`${subject.subject}-${subject.competencyNumber}-criteria`}>
                          {subject.activities.map((activity, idx) => {
                            const data = palierData.criteria[subject.subject]?.[subject.competency]?.[activity];
                            return (
                              <td key={`${subject.subject}-${subject.competencyNumber}-${idx}-criteria`} className="border border-gray-400 p-1 text-center">
                                {data?.criterionGrade?.toFixed(1) || '—'}
                              </td>
                            );
                          })}
                          <td className="border border-gray-400 p-1 text-center bg-yellow-50 font-semibold">
                            {/* NM calculé automatiquement */}
                            {(() => {
                              const activities = subject.activities;
                              const grades = activities.map(a => 
                                palierData.criteria[subject.subject]?.[subject.competency]?.[a]?.criterionGrade
                              ).filter(g => g !== undefined) as number[];
                              if (grades.length === 0) return '—';
                              const avg = grades.reduce((sum, g) => sum + g, 0) / grades.length;
                              return avg.toFixed(1);
                            })()}
                          </td>
                        </React.Fragment>
                      ))
                    )}
                  </tr>
                  
                  {/* Note de la compétence */}
                  <tr>
                    <td className="sticky-col border border-gray-400 p-1 font-semibold bg-gray-100">
                      Note de la compétence
                    </td>
                    {Object.values(groupedSubjects).map((domainSubjects) =>
                      domainSubjects.map((subject) => {
                        const colSpan = subject.activities.length + 1;
                        const data = palierData.criteria[subject.subject]?.[subject.competency]?.[subject.activities[0]];
                        return (
                          <td key={`${subject.subject}-${subject.competencyNumber}-comp-grade`} colSpan={colSpan} className="border border-gray-400 p-1 text-center font-semibold">
                            {data?.competencyGrade?.toFixed(1) || '—'}
                          </td>
                        );
                      })
                    )}
                  </tr>
                  
                  {/* Maîtrise de la compétence */}
                  <tr>
                    <td className="sticky-col border border-gray-400 p-1 font-semibold bg-gray-100">
                      Maîtrise de la compétence
                    </td>
                    {Object.values(groupedSubjects).map((domainSubjects) =>
                      domainSubjects.map((subject) => {
                        const colSpan = subject.activities.length + 1;
                        const data = palierData.criteria[subject.subject]?.[subject.competency]?.[subject.activities[0]];
                        return (
                          <td key={`${subject.subject}-${subject.competencyNumber}-comp-mastery`} colSpan={colSpan} className={`border border-gray-400 p-1 text-center font-semibold ${getMasteryColor(data?.competencyMastery)}`}>
                            {data?.competencyMastery || '—'}
                          </td>
                        );
                      })
                    )}
                  </tr>
                  
                  {/* Maîtrise de la matière */}
                  <tr>
                    <td className="sticky-col border border-gray-400 p-1 font-semibold bg-gray-100">
                      Maîtrise de la matière
                    </td>
                    {Object.values(groupedSubjects).map((domainSubjects) =>
                      domainSubjects.map((subject) => {
                        const colSpan = subject.activities.length + 1;
                        const data = palierData.criteria[subject.subject]?.[subject.competency]?.[subject.activities[0]];
                        return (
                          <td key={`${subject.subject}-${subject.competencyNumber}-subject-mastery`} colSpan={colSpan} className={`border border-gray-400 p-1 text-center font-semibold ${getMasteryColor(data?.subjectMastery)}`}>
                            {data?.subjectMastery || '—'}
                          </td>
                        );
                      })
                    )}
                  </tr>
                  
                  {/* Maîtrise du palier en EDM&EAS, Français et Mathématiques */}
                  {palierData.palier <= 5 && (
                    <tr>
                      <td className="sticky-col border border-gray-400 p-1 font-semibold bg-gray-100">
                        Maîtrise du palier en EDM&EAS, Français et Mathématiques
                      </td>
                      <td colSpan={totalCols - 1} className={`border border-gray-400 p-1 text-center font-bold ${getMasteryColor(palierData.edmFrenchMathMastery)}`}>
                        {palierData.edmFrenchMathMastery || '—'}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {/* Profil de sortie */}
              <tr className="bg-yellow-100">
                <td colSpan={totalCols} className="border border-gray-400 p-2 font-bold text-center">
                  PROFIL DE SORTIE
                </td>
              </tr>
              
              {/* Note annuelle de la compétence */}
              <tr>
                <td className="sticky-col border border-gray-400 p-1 font-semibold bg-yellow-50">
                  Note annuelle de la compétence
                </td>
                {Object.values(groupedSubjects).map((domainSubjects) =>
                  domainSubjects.map((subject) => {
                    const colSpan = subject.activities.length + 1;
                    const data = exitProfile[subject.subject]?.[subject.competency];
                    return (
                      <td key={`${subject.subject}-${subject.competencyNumber}-annual-comp-grade`} colSpan={colSpan} className="border border-gray-400 p-1 text-center font-semibold">
                        {data?.annualCompetencyGrade?.toFixed(1) || '—'}
                      </td>
                    );
                  })
                )}
              </tr>
              
              {/* Maîtrise annuelle de la compétence */}
              <tr>
                <td className="sticky-col border border-gray-400 p-1 font-semibold bg-yellow-50">
                  Maîtrise annuelle de la compétence
                </td>
                {Object.values(groupedSubjects).map((domainSubjects) =>
                  domainSubjects.map((subject) => {
                    const colSpan = subject.activities.length + 1;
                    const data = exitProfile[subject.subject]?.[subject.competency];
                    return (
                      <td key={`${subject.subject}-${subject.competencyNumber}-annual-comp-mastery`} colSpan={colSpan} className={`border border-gray-400 p-1 text-center font-semibold ${getMasteryColor(data?.annualCompetencyMastery)}`}>
                        {data?.annualCompetencyMastery || '—'}
                      </td>
                    );
                  })
                )}
              </tr>
              
              {/* Maîtrise annuelle de la matière */}
              <tr>
                <td className="sticky-col border border-gray-400 p-1 font-semibold bg-yellow-50">
                  Maîtrise annuelle de la matière
                </td>
                {Object.values(groupedSubjects).map((domainSubjects) =>
                  domainSubjects.map((subject) => {
                    const colSpan = subject.activities.length + 1;
                    const data = exitProfile[subject.subject]?.[subject.competency];
                    return (
                      <td key={`${subject.subject}-${subject.competencyNumber}-annual-subject-mastery`} colSpan={colSpan} className={`border border-gray-400 p-1 text-center font-semibold ${getMasteryColor(data?.annualSubjectMastery)}`}>
                        {data?.annualSubjectMastery || '—'}
                      </td>
                    );
                  })
                )}
              </tr>
              
              {/* Maîtrise annuelle en EDM&EAS, Français et Mathématiques */}
              <tr>
                <td className="sticky-col border border-gray-400 p-1 font-semibold bg-yellow-50">
                  Maîtrise annuelle en EDM&EAS, Français et Mathématiques
                </td>
                <td colSpan={totalCols - 1} className={`border border-gray-400 p-1 text-center font-bold ${getMasteryColor(exitProfile.edmFrenchMathAnnualMastery)}`}>
                  {exitProfile.edmFrenchMathAnnualMastery || '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures et Décision */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="border-2 border-gray-400 rounded-lg p-4">
            <h3 className="font-bold text-center mb-4 border-b border-gray-400 pb-2">
              SIGNATURES
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-semibold mb-2">Visa du(de la) Directeur(trice):</p>
                <div className="border-b-2 border-gray-400 h-12"></div>
                <p className="text-gray-600 mt-1">{signatures?.director || ''}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Visa de l'enseignant(e):</p>
                <div className="border-b-2 border-gray-400 h-12"></div>
                <p className="text-gray-600 mt-1">{signatures?.teacher || ''}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Visa du(de la) parent(e):</p>
                <div className="border-b-2 border-gray-400 h-12"></div>
                <p className="text-gray-600 mt-1">{signatures?.parent || ''}</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-400 rounded-lg p-4">
            <h3 className="font-bold text-center mb-4 border-b border-gray-400 pb-2">
              DÉCISION DU CONSEIL DE CLASSE EN FIN D'ANNÉE
            </h3>
            <textarea
              className="w-full h-40 border border-gray-300 rounded p-2 text-xs"
              readOnly
              value={classDecision || ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};






