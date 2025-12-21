import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface SubjectCompetency {
  subject: string;
  competency: string;
  competencyNumber: number;
  activities: string[];
}

interface PalierData {
  palier: number;
  criteria: {
    [subjectKey: string]: {
      [competencyKey: string]: {
        [activityKey: string]: {
          criterionGrade?: number;
          competencyGrade?: number;
          competencyMastery?: string;
          subjectMastery?: string;
        };
      };
    };
  };
  edmFrenchMathMastery?: string;
}

interface ExitProfile {
  [subjectKey: string]: {
    [competencyKey: string]: {
      annualCompetencyGrade?: number;
      annualCompetencyMastery?: string;
      annualSubjectMastery?: string;
    };
  };
  edmFrenchMathAnnualMastery?: string;
}

interface SignaturesByPalier {
  [palier: number]: {
    director?: string;
    teacher?: string;
    parent?: string;
  };
}

interface BulletinPrimaireEditableProps {
  studentName: string;
  studentFirstName: string;
  className: string;
  academicYear: string;
  subjects: SubjectCompetency[];
  initialData?: {
    paliers: PalierData[];
    exitProfile: ExitProfile;
    signatures: SignaturesByPalier;
    classDecision?: string;
  };
  onDataChange?: (data: any) => void;
  readOnly?: boolean;
}

export const BulletinPrimaireEditable: React.FC<BulletinPrimaireEditableProps> = ({
  studentName,
  studentFirstName,
  className,
  academicYear,
  subjects,
  initialData,
  onDataChange,
  readOnly = false,
}) => {
  const { user } = useAuth();
  const isReadOnly = readOnly || (user?.role === 'PARENT');

  // Initialiser les données
  const [paliers, setPaliers] = useState<PalierData[]>(initialData?.paliers || []);
  const [exitProfile, setExitProfile] = useState<ExitProfile>(initialData?.exitProfile || {});
  const [signatures, setSignatures] = useState<SignaturesByPalier>(initialData?.signatures || {});
  const [classDecision, setClassDecision] = useState<string>(initialData?.classDecision || '');

  // Initialiser les paliers si vides
  useEffect(() => {
    if (paliers.length === 0) {
      const newPaliers: PalierData[] = [1, 2, 3, 4, 5].map((palier) => ({
        palier,
        criteria: {},
        edmFrenchMathMastery: '',
      }));
      setPaliers(newPaliers);
    }
  }, []);

  // Notifier les changements
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        paliers,
        exitProfile,
        signatures,
        classDecision,
      });
    }
  }, [paliers, exitProfile, signatures, classDecision, onDataChange]);

  // Grouper les sujets par domaine
  const groupedSubjects: { [domain: string]: SubjectCompetency[] } = {};
  subjects.forEach((subject) => {
    const domain = subject.subject.split(' ')[0];
    if (!groupedSubjects[domain]) {
      groupedSubjects[domain] = [];
    }
    groupedSubjects[domain].push(subject);
  });

  // Calculer le nombre total de colonnes
  let totalCols = 1;
  Object.values(groupedSubjects).forEach((domainSubjects) => {
    domainSubjects.forEach((subject) => {
      totalCols += subject.activities.length + 1;
    });
  });

  // Fonctions de mise à jour
  const updateCriterionGrade = (
    palier: number,
    subject: string,
    competency: string,
    activity: string,
    value: number | ''
  ) => {
    setPaliers((prev) =>
      prev.map((p) => {
        if (p.palier !== palier) return p;
        const newCriteria = { ...p.criteria };
        if (!newCriteria[subject]) newCriteria[subject] = {};
        if (!newCriteria[subject][competency]) newCriteria[subject][competency] = {};
        if (!newCriteria[subject][competency][activity]) {
          newCriteria[subject][competency][activity] = {};
        }
        newCriteria[subject][competency][activity] = {
          ...newCriteria[subject][competency][activity],
          criterionGrade: value === '' ? undefined : Number(value),
        };
        return { ...p, criteria: newCriteria };
      })
    );
  };

  const updateCompetencyGrade = (
    palier: number,
    subject: string,
    competency: string,
    value: number | ''
  ) => {
    setPaliers((prev) =>
      prev.map((p) => {
        if (p.palier !== palier) return p;
        const newCriteria = { ...p.criteria };
        if (!newCriteria[subject]) newCriteria[subject] = {};
        if (!newCriteria[subject][competency]) newCriteria[subject][competency] = {};
        const firstActivity = subjects.find((s) => s.subject === subject && s.competency === competency)?.activities[0];
        if (firstActivity) {
          if (!newCriteria[subject][competency][firstActivity]) {
            newCriteria[subject][competency][firstActivity] = {};
          }
          newCriteria[subject][competency][firstActivity] = {
            ...newCriteria[subject][competency][firstActivity],
            competencyGrade: value === '' ? undefined : Number(value),
          };
        }
        return { ...p, criteria: newCriteria };
      })
    );
  };

  const updateMastery = (
    palier: number,
    subject: string,
    competency: string,
    type: 'competencyMastery' | 'subjectMastery',
    value: string
  ) => {
    setPaliers((prev) =>
      prev.map((p) => {
        if (p.palier !== palier) return p;
        const newCriteria = { ...p.criteria };
        if (!newCriteria[subject]) newCriteria[subject] = {};
        if (!newCriteria[subject][competency]) newCriteria[subject][competency] = {};
        const firstActivity = subjects.find((s) => s.subject === subject && s.competency === competency)?.activities[0];
        if (firstActivity) {
          if (!newCriteria[subject][competency][firstActivity]) {
            newCriteria[subject][competency][firstActivity] = {};
          }
          newCriteria[subject][competency][firstActivity] = {
            ...newCriteria[subject][competency][firstActivity],
            [type]: value || undefined,
          };
        }
        return { ...p, criteria: newCriteria };
      })
    );
  };

  const updateEdmFrenchMathMastery = (palier: number, value: string) => {
    setPaliers((prev) =>
      prev.map((p) => (p.palier === palier ? { ...p, edmFrenchMathMastery: value || undefined } : p))
    );
  };

  const updateSignature = (palier: number, type: 'director' | 'teacher' | 'parent', value: string) => {
    setSignatures((prev) => ({
      ...prev,
      [palier]: {
        ...prev[palier],
        [type]: value,
      },
    }));
  };

  // Calculer NM automatiquement
  const calculateNM = (palier: number, subject: SubjectCompetency): number | null => {
    const palierData = paliers.find((p) => p.palier === palier);
    if (!palierData) return null;
    const grades = subject.activities
      .map((activity) => palierData.criteria[subject.subject]?.[subject.competency]?.[activity]?.criterionGrade)
      .filter((g): g is number => g !== undefined);
    if (grades.length === 0) return null;
    return grades.reduce((sum, g) => sum + g, 0) / grades.length;
  };

  return (
    <div className="bulletin-primaire-editable">
      <style>{`
        @media print {
          .bulletin-primaire-editable input,
          .bulletin-primaire-editable textarea,
          .bulletin-primaire-editable select {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
          }
          .bulletin-primaire-editable input:focus,
          .bulletin-primaire-editable textarea:focus,
          .bulletin-primaire-editable select:focus {
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
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
        .bulletin-input {
          width: 100%;
          border: 1px solid #cbd5e0;
          padding: 2px 4px;
          text-align: center;
          font-size: 11px;
        }
        .bulletin-input-criterion {
          width: 100%;
          border: 1px solid #cbd5e0;
          padding: 4px 6px;
          text-align: center;
          font-size: 12px;
          min-width: 50px;
        }
        .bulletin-input:focus,
        .bulletin-input-criterion:focus {
          border-color: #4299e1;
          outline: none;
        }
        .bulletin-textarea {
          width: 100%;
          border: 1px solid #cbd5e0;
          padding: 4px;
          font-size: 11px;
          resize: vertical;
        }
        .bulletin-textarea:focus {
          border-color: #4299e1;
          outline: none;
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
                    const colSpan = subject.activities.length + 1;
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
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  step="0.1"
                                  value={data?.criterionGrade || ''}
                                  onChange={(e) =>
                                    updateCriterionGrade(
                                      palierData.palier,
                                      subject.subject,
                                      subject.competency,
                                      activity,
                                      e.target.value
                                    )
                                  }
                                  disabled={isReadOnly}
                                  className="bulletin-input-criterion"
                                  placeholder="—"
                                />
                              </td>
                            );
                          })}
                          <td className="border border-gray-400 p-1 text-center bg-yellow-50 font-semibold">
                            {(() => {
                              const nm = calculateNM(palierData.palier, subject);
                              return nm !== null ? nm.toFixed(1) : '—';
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
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.1"
                              value={data?.competencyGrade || ''}
                              onChange={(e) =>
                                updateCompetencyGrade(
                                  palierData.palier,
                                  subject.subject,
                                  subject.competency,
                                  e.target.value
                                )
                              }
                              disabled={isReadOnly}
                              className="bulletin-input"
                              placeholder="—"
                            />
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
                          <td key={`${subject.subject}-${subject.competencyNumber}-comp-mastery`} colSpan={colSpan} className="border border-gray-400 p-1 text-center font-semibold">
                            <input
                              type="text"
                              value={data?.competencyMastery || ''}
                              onChange={(e) =>
                                updateMastery(
                                  palierData.palier,
                                  subject.subject,
                                  subject.competency,
                                  'competencyMastery',
                                  e.target.value
                                )
                              }
                              disabled={isReadOnly}
                              className="bulletin-input"
                              placeholder="Max/Min/Part/NM"
                            />
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
                          <td key={`${subject.subject}-${subject.competencyNumber}-subject-mastery`} colSpan={colSpan} className="border border-gray-400 p-1 text-center font-semibold">
                            <input
                              type="text"
                              value={data?.subjectMastery || ''}
                              onChange={(e) =>
                                updateMastery(
                                  palierData.palier,
                                  subject.subject,
                                  subject.competency,
                                  'subjectMastery',
                                  e.target.value
                                )
                              }
                              disabled={isReadOnly}
                              className="bulletin-input"
                              placeholder="Max/Min/Part/NM"
                            />
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
                      <td colSpan={totalCols - 1} className="border border-gray-400 p-1 text-center font-bold">
                        <input
                          type="text"
                          value={palierData.edmFrenchMathMastery || ''}
                          onChange={(e) => updateEdmFrenchMathMastery(palierData.palier, e.target.value)}
                          disabled={isReadOnly}
                          className="bulletin-input"
                          placeholder="Max/Min/Part/NM"
                        />
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
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          value={data?.annualCompetencyGrade || ''}
                          onChange={(e) => {
                            const newExitProfile = { ...exitProfile };
                            if (!newExitProfile[subject.subject]) newExitProfile[subject.subject] = {};
                            if (!newExitProfile[subject.subject][subject.competency]) {
                              newExitProfile[subject.subject][subject.competency] = {};
                            }
                            newExitProfile[subject.subject][subject.competency] = {
                              ...newExitProfile[subject.subject][subject.competency],
                              annualCompetencyGrade: e.target.value === '' ? undefined : Number(e.target.value),
                            };
                            setExitProfile(newExitProfile);
                          }}
                          disabled={isReadOnly}
                          className="bulletin-input"
                          placeholder="—"
                        />
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
                      <td key={`${subject.subject}-${subject.competencyNumber}-annual-comp-mastery`} colSpan={colSpan} className="border border-gray-400 p-1 text-center font-semibold">
                        <input
                          type="text"
                          value={data?.annualCompetencyMastery || ''}
                          onChange={(e) => {
                            const newExitProfile = { ...exitProfile };
                            if (!newExitProfile[subject.subject]) newExitProfile[subject.subject] = {};
                            if (!newExitProfile[subject.subject][subject.competency]) {
                              newExitProfile[subject.subject][subject.competency] = {};
                            }
                            newExitProfile[subject.subject][subject.competency] = {
                              ...newExitProfile[subject.subject][subject.competency],
                              annualCompetencyMastery: e.target.value || undefined,
                            };
                            setExitProfile(newExitProfile);
                          }}
                          disabled={isReadOnly}
                          className="bulletin-input"
                          placeholder="Max/Min/Part/NM"
                        />
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
                      <td key={`${subject.subject}-${subject.competencyNumber}-annual-subject-mastery`} colSpan={colSpan} className="border border-gray-400 p-1 text-center font-semibold">
                        <input
                          type="text"
                          value={data?.annualSubjectMastery || ''}
                          onChange={(e) => {
                            const newExitProfile = { ...exitProfile };
                            if (!newExitProfile[subject.subject]) newExitProfile[subject.subject] = {};
                            if (!newExitProfile[subject.subject][subject.competency]) {
                              newExitProfile[subject.subject][subject.competency] = {};
                            }
                            newExitProfile[subject.subject][subject.competency] = {
                              ...newExitProfile[subject.subject][subject.competency],
                              annualSubjectMastery: e.target.value || undefined,
                            };
                            setExitProfile(newExitProfile);
                          }}
                          disabled={isReadOnly}
                          className="bulletin-input"
                          placeholder="Max/Min/Part/NM"
                        />
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
                <td colSpan={totalCols - 1} className="border border-gray-400 p-1 text-center font-bold">
                  <input
                    type="text"
                    value={exitProfile.edmFrenchMathAnnualMastery || ''}
                    onChange={(e) => {
                      setExitProfile({ ...exitProfile, edmFrenchMathAnnualMastery: e.target.value || undefined });
                    }}
                    disabled={isReadOnly}
                    className="bulletin-input"
                    placeholder="Max/Min/Part/NM"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures et Décision */}
        <div className="mt-6">
          {/* Signatures par Palier */}
          <div className="border-2 border-gray-400 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-center mb-4 border-b border-gray-400 pb-2">
              SIGNATURES PAR PALIER
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-gray-400 p-2 text-center font-bold">Palier</th>
                    <th className="border border-gray-400 p-2 text-center font-bold">Visa du(de la) Directeur(trice)</th>
                    <th className="border border-gray-400 p-2 text-center font-bold">Visa de l'enseignant(e)</th>
                    <th className="border border-gray-400 p-2 text-center font-bold">Visa du(de la) parent(e)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((palier) => (
                    <tr key={palier}>
                      <td className="border border-gray-400 p-2 text-center font-semibold bg-gray-50">
                        Palier {palier}
                      </td>
                      <td className="border border-gray-400 p-2">
                        <input
                          type="text"
                          value={signatures[palier]?.director || ''}
                          onChange={(e) => updateSignature(palier, 'director', e.target.value)}
                          disabled={isReadOnly}
                          className="bulletin-input"
                          placeholder="Signature..."
                        />
                      </td>
                      <td className="border border-gray-400 p-2">
                        <input
                          type="text"
                          value={signatures[palier]?.teacher || ''}
                          onChange={(e) => updateSignature(palier, 'teacher', e.target.value)}
                          disabled={isReadOnly}
                          className="bulletin-input"
                          placeholder="Signature..."
                        />
                      </td>
                      <td className="border border-gray-400 p-2">
                        <input
                          type="text"
                          value={signatures[palier]?.parent || ''}
                          onChange={(e) => updateSignature(palier, 'parent', e.target.value)}
                          disabled={isReadOnly}
                          className="bulletin-input"
                          placeholder="Signature..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Décision du Conseil */}
          <div className="border-2 border-gray-400 rounded-lg p-4">
            <h3 className="font-bold text-center mb-4 border-b border-gray-400 pb-2">
              DÉCISION DU CONSEIL DE CLASSE EN FIN D'ANNÉE
            </h3>
            <textarea
              className="bulletin-textarea w-full h-40"
              value={classDecision}
              onChange={(e) => setClassDecision(e.target.value)}
              disabled={isReadOnly}
              placeholder="Décision du conseil de classe..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};


