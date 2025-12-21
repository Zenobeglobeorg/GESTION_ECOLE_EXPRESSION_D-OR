import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface CompetencyData {
  domain: string;
  competency: string;
  cb: number; // 1 ou 2
  activities: string[];
  paliers: {
    [key: number]: string; // Valeur saisie (A, B, C, D, X, /, ou note)
  };
}

interface GeneralAttitude {
  label: string;
  options: {
    label: string;
    checked: boolean;
  }[];
}

interface SignaturesByPalier {
  [palier: number]: {
    director?: string;
    teacher?: string;
    parent?: string;
  };
}

interface BulletinMaternelleEditableProps {
  studentName: string;
  studentFirstName: string;
  className: string;
  academicYear: string;
  initialData?: {
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
    signatures: SignaturesByPalier;
  };
  onDataChange?: (data: {
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
    signatures: SignaturesByPalier;
  }) => void;
  readOnly?: boolean;
}

export const BulletinMaternelleEditable: React.FC<BulletinMaternelleEditableProps> = ({
  studentName,
  studentFirstName,
  className,
  academicYear,
  initialData,
  onDataChange,
  readOnly = false,
}) => {
  const { user } = useAuth();
  const isReadOnly = readOnly || (user?.role === 'PARENT');

  // Initialiser les données
  const [competencies, setCompetencies] = useState<CompetencyData[]>(
    initialData?.competencies || []
  );
  const [generalAttitudes, setGeneralAttitudes] = useState<GeneralAttitude[]>(
    initialData?.generalAttitudes || []
  );
  const [remediations, setRemediations] = useState({
    teacherAdvice: initialData?.remediations?.teacherAdvice || '',
    socialService: initialData?.remediations?.socialService || false,
    psychologist: initialData?.remediations?.psychologist || false,
    speechTherapist: initialData?.remediations?.speechTherapist || false,
    ophthalmologist: initialData?.remediations?.ophthalmologist || false,
    dentist: initialData?.remediations?.dentist || false,
  });
  const [signatures, setSignatures] = useState<SignaturesByPalier>(
    initialData?.signatures || {}
  );

  // Initialiser les compétences si vides
  useEffect(() => {
    if (competencies.length === 0 && !initialData?.competencies) {
      const defaultCompetencies: CompetencyData[] = [
        {
          domain: '1 Communication/Expression',
          competency: 'Langage, Poésie, Comptine, Conte/histoire',
          cb: 1,
          activities: ['Langage', 'Poésie', 'Comptine', 'Conte/histoire'],
          paliers: {},
        },
        {
          domain: '1 Communication/Expression',
          competency: 'Initiation lecture, Graphisme, Initiation écriture',
          cb: 2,
          activities: ['Initiation lecture', 'Graphisme', 'Initiation écriture'],
          paliers: {},
        },
        {
          domain: '2 Mathématiques',
          competency: 'Géométrie mesure, logique',
          cb: 1,
          activities: ['Géométrie', 'Mesure', 'Logique'],
          paliers: {},
        },
        {
          domain: '2 Mathématiques',
          competency: 'Numé/Arithm',
          cb: 2,
          activities: ['Numération', 'Arithmétique'],
          paliers: {},
        },
        {
          domain: '3 Éveil',
          competency: 'Ed Psychomotrice, Éducation civique, Éducation morale, Éducation routière',
          cb: 1,
          activities: ['Ed Psychomotrice', 'Éducation civique', 'Éducation morale', 'Éducation routière'],
          paliers: {},
        },
        {
          domain: '3 Éveil',
          competency: 'Activité manuelle (Dessin, Peinture), Ed. Music/chant, Éveil scientifique, Éveil techno, Ed. à la santé, Ed. à l\'environ',
          cb: 2,
          activities: ['Dessin', 'Peinture', 'Ed. Music/chant', 'Éveil scientifique', 'Éveil techno', 'Ed. à la santé', 'Ed. à l\'environ'],
          paliers: {},
        },
      ];
      setCompetencies(defaultCompetencies);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialiser les attitudes générales si vides
  useEffect(() => {
    if (generalAttitudes.length === 0 && !initialData?.generalAttitudes) {
      const defaultAttitudes: GeneralAttitude[] = [
        {
          label: 'Fréquentation scolaire',
          options: [
            { label: 'Régulière', checked: false },
            { label: 'Irrégulière', checked: false },
            { label: 'Absences justifiées', checked: false },
            { label: 'Absences injustifiées', checked: false },
          ],
        },
        {
          label: 'Comportement en classe',
          options: [
            { label: 'Rêveur', checked: false },
            { label: 'Discipliné', checked: false },
            { label: 'Indiscipliné', checked: false },
          ],
        },
        {
          label: 'Comportement en récréation',
          options: [
            { label: 'Agressif', checked: false },
            { label: 'Turbulent', checked: false },
            { label: 'Calme', checked: false },
          ],
        },
        {
          label: 'Participation',
          options: [
            { label: 'Actif', checked: false },
            { label: 'Passif', checked: false },
          ],
        },
        {
          label: 'Degré d\'attention',
          options: [
            { label: 'Concentré', checked: false },
            { label: 'Distrait', checked: false },
            { label: 'Peu attentif', checked: false },
          ],
        },
        {
          label: 'Mémoire',
          options: [
            { label: 'Retient facilement et intelligemment', checked: false },
            { label: 'Retient', checked: false },
            { label: 'Retient peu', checked: false },
            { label: 'Ne retient pas', checked: false },
          ],
        },
        {
          label: 'Compréhension',
          options: [
            { label: 'Rapide et sûre', checked: false },
            { label: 'Lente et sûre', checked: false },
            { label: 'Difficile et peu sûre', checked: false },
          ],
        },
        {
          label: 'Rythme de travail',
          options: [
            { label: 'Rapide', checked: false },
            { label: 'Normal', checked: false },
            { label: 'Très lent', checked: false },
          ],
        },
        {
          label: 'Appréciation générale De l\'enseignant(e)',
          options: [
            { label: 'Autonome', checked: false },
            { label: 'Non autonome', checked: false },
          ],
        },
      ];
      setGeneralAttitudes(defaultAttitudes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notifier les changements
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        competencies,
        generalAttitudes,
        remediations,
        signatures,
      });
    }
  }, [competencies, generalAttitudes, remediations, signatures, onDataChange]);

  // Fonctions de mise à jour
  const updatePalierValue = (compIdx: number, palier: number, value: string) => {
    setCompetencies((prev) =>
      prev.map((comp, idx) => {
        if (idx !== compIdx) return comp;
        return {
          ...comp,
          paliers: {
            ...comp.paliers,
            [palier]: value,
          },
        };
      })
    );
  };

  const updateAttitude = (attitudeIdx: number, optionIdx: number, checked: boolean) => {
    setGeneralAttitudes((prev) =>
      prev.map((att, idx) => {
        if (idx !== attitudeIdx) return att;
        return {
          ...att,
          options: att.options.map((opt, optIdx) =>
            optIdx === optionIdx ? { ...opt, checked } : opt
          ),
        };
      })
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

  return (
    <div className="bulletin-maternelle-editable">
      <style>{`
        @media print {
          .bulletin-maternelle-editable input,
          .bulletin-maternelle-editable textarea,
          .bulletin-maternelle-editable select {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
          }
          .bulletin-maternelle-editable input:focus,
          .bulletin-maternelle-editable textarea:focus,
          .bulletin-maternelle-editable select:focus {
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
        }
        .bulletin-input-small {
          width: 100%;
          border: 1px solid #cbd5e0;
          padding: 1px 2px;
          text-align: center;
          font-size: 9px;
          min-height: 18px;
        }
        .bulletin-input-small:focus {
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
                  <th className="border border-gray-400 p-2 text-left font-bold" rowSpan={2}>Domaines</th>
                  <th className="border border-gray-400 p-2 text-left font-bold" rowSpan={2}>Compétences</th>
                  <th className="border border-gray-400 p-2 text-center font-bold" rowSpan={2}>CB</th>
                  {[1, 2, 3, 4, 5, 6].map((palier) => (
                    <th key={palier} className="border border-gray-400 p-1 text-center font-bold text-[8px]" colSpan={4}>
                      Palier {palier}
                    </th>
                  ))}
                </tr>
                <tr className="bg-pink-50">
                  {[1, 2, 3, 4, 5, 6].map((palier) => (
                    <React.Fragment key={palier}>
                      <th className="border border-gray-400 p-1 text-center text-[8px] font-semibold">A</th>
                      <th className="border border-gray-400 p-1 text-center text-[8px] font-semibold">B</th>
                      <th className="border border-gray-400 p-1 text-center text-[8px] font-semibold">C</th>
                      <th className="border border-gray-400 p-1 text-center text-[8px] font-semibold">D</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competencies.map((comp, compIdx) => (
                  <tr key={compIdx} className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-semibold">
                      {comp.domain}
                    </td>
                    <td className="border border-gray-400 p-2">
                      <div className="font-semibold mb-1">{comp.competency}</div>
                      <div className="text-[9px] text-gray-600 mt-1">
                        {comp.activities.join(', ')}
                      </div>
                    </td>
                    <td className="border border-gray-400 p-2 text-center font-bold">
                      CB{comp.cb}
                    </td>
                    {[1, 2, 3, 4, 5, 6].map((palier) => {
                      const value = comp.paliers[palier] || '';
                      // Une seule grande case par palier qui fusionne les 4 colonnes A, B, C, D
                      return (
                        <td key={palier} className="border border-gray-400 p-2 text-center" colSpan={4}>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updatePalierValue(compIdx, palier, e.target.value)}
                            disabled={isReadOnly}
                            className="bulletin-input-small w-full"
                            placeholder="A/B/C/D/X/— ou texte libre"
                          />
                        </td>
                      );
                    })}
                  </tr>
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
              {generalAttitudes.map((attitude, attIdx) => (
                <div key={attIdx} className="border-b border-gray-300 pb-2">
                  <p className="font-semibold mb-1">{attitude.label}:</p>
                  <div className="space-y-1">
                    {attitude.options.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.checked}
                          onChange={(e) => updateAttitude(attIdx, optIdx, e.target.checked)}
                          disabled={isReadOnly}
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
                  className="bulletin-textarea w-full"
                  rows={3}
                  value={remediations.teacherAdvice}
                  onChange={(e) => setRemediations({ ...remediations, teacherAdvice: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="Avis et conseils..."
                />
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remediations.socialService}
                    onChange={(e) => setRemediations({ ...remediations, socialService: e.target.checked })}
                    disabled={isReadOnly}
                    className="w-3 h-3"
                  />
                  <span>Orienter vers le service social</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remediations.psychologist}
                    onChange={(e) => setRemediations({ ...remediations, psychologist: e.target.checked })}
                    disabled={isReadOnly}
                    className="w-3 h-3"
                  />
                  <span>Orienter vers le psychologue</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remediations.speechTherapist}
                    onChange={(e) => setRemediations({ ...remediations, speechTherapist: e.target.checked })}
                    disabled={isReadOnly}
                    className="w-3 h-3"
                  />
                  <span>Orienter vers l'orthophoniste</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remediations.ophthalmologist}
                    onChange={(e) => setRemediations({ ...remediations, ophthalmologist: e.target.checked })}
                    disabled={isReadOnly}
                    className="w-3 h-3"
                  />
                  <span>Orienter vers l'ophtalmologue</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remediations.dentist}
                    onChange={(e) => setRemediations({ ...remediations, dentist: e.target.checked })}
                    disabled={isReadOnly}
                    className="w-3 h-3"
                  />
                  <span>Orienter vers le dentiste</span>
                </label>
              </div>
            </div>
          </div>

          {/* Signatures par Palier */}
          <div className="border-2 border-gray-400 rounded-lg p-4">
            <h3 className="font-bold text-center mb-4 border-b border-gray-400 pb-2">
              SIGNATURES PAR PALIER
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-pink-50">
                    <th className="border border-gray-400 p-1 text-center font-bold text-[8px]">Palier</th>
                    <th className="border border-gray-400 p-1 text-center font-bold text-[8px]">Visa du(de la) Directeur(trice)</th>
                    <th className="border border-gray-400 p-1 text-center font-bold text-[8px]">Visa de l'enseignant(e)</th>
                    <th className="border border-gray-400 p-1 text-center font-bold text-[8px]">Visa du(de la) parent(e)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((palier) => (
                    <tr key={palier}>
                      <td className="border border-gray-400 p-1 text-center font-semibold bg-gray-50 text-[8px]">
                        Palier {palier}
                      </td>
                      <td className="border border-gray-400 p-1">
                        <input
                          type="text"
                          value={signatures[palier]?.director || ''}
                          onChange={(e) => updateSignature(palier, 'director', e.target.value)}
                          disabled={isReadOnly}
                          className="bulletin-input-small"
                          placeholder="Signature..."
                        />
                      </td>
                      <td className="border border-gray-400 p-1">
                        <input
                          type="text"
                          value={signatures[palier]?.teacher || ''}
                          onChange={(e) => updateSignature(palier, 'teacher', e.target.value)}
                          disabled={isReadOnly}
                          className="bulletin-input-small"
                          placeholder="Signature..."
                        />
                      </td>
                      <td className="border border-gray-400 p-1">
                        <input
                          type="text"
                          value={signatures[palier]?.parent || ''}
                          onChange={(e) => updateSignature(palier, 'parent', e.target.value)}
                          disabled={isReadOnly}
                          className="bulletin-input-small"
                          placeholder="Signature..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


