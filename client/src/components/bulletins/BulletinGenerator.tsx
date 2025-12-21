import React, { useState, useEffect } from 'react';
import { BulletinCover } from './BulletinCover';
import { BulletinMaternelleEditable } from './BulletinMaternelleEditable';
import { BulletinPrimaireEditable } from './BulletinPrimaireEditable';
import * as bulletinService from '../../services/bulletinService';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  class?: {
    id: number;
    name: string;
    level: string;
  };
}

interface BulletinGeneratorProps {
  student: Student;
  academicYear?: string;
  teacherName?: string;
  directorName?: string;
  onClose?: () => void;
  mode?: 'edit' | 'preview'; // Mode édition ou aperçu
  bulletinId?: number; // ID du bulletin à charger directement (optionnel)
}

/**
 * Détermine si le niveau est Maternelle ou Pré-maternelle
 */
const isMaternelleLevel = (level: string): boolean => {
  const levelUpper = level?.toUpperCase() || '';
  return (
    levelUpper.includes('MATERNELLE') ||
    levelUpper.includes('PRE-MATERNELLE') ||
    levelUpper.includes('PRÉ-MATERNELLE') ||
    levelUpper.includes('PRE-PRIMAIRE') ||
    levelUpper.includes('PRÉ-PRIMAIRE')
  );
};

/**
 * Génère des données mock pour la Maternelle
 */
const generateMaternelleMockData = () => {
  return {
    competencies: [
      {
        domain: '1 Communication/Expression',
        competency: 'Langage, Poésie, Comptine, Conte/histoire',
        cb: 1,
        activities: ['Langage', 'Poésie', 'Comptine', 'Conte/histoire'],
        paliers: {
          1: 'B',
          2: 'A',
          3: 'A',
          4: 'A',
          5: 'A',
          6: 'A',
        },
      },
      {
        domain: '1 Communication/Expression',
        competency: 'Initiation lecture, Graphisme, Initiation écriture',
        cb: 2,
        activities: ['Initiation lecture', 'Graphisme', 'Initiation écriture'],
        paliers: {
          1: 'C',
          2: 'B',
          3: 'B',
          4: 'A',
          5: 'A',
          6: 'A',
        },
      },
      {
        domain: '2 Mathématiques',
        competency: 'Géométrie mesure, logique',
        cb: 1,
        activities: ['Géométrie', 'Mesure', 'Logique'],
        paliers: {
          1: 'B',
          2: 'A',
          3: 'A',
          4: 'A',
          5: 'A',
          6: 'A',
        },
      },
      {
        domain: '2 Mathématiques',
        competency: 'Numé/Arithm',
        cb: 2,
        activities: ['Numération', 'Arithmétique'],
        paliers: {
          1: 'C',
          2: 'B',
          3: 'B',
          4: 'A',
          5: 'A',
          6: 'A',
        },
      },
      {
        domain: '3 Éveil',
        competency: 'Ed Psychomotrice, Éducation civique, Éducation morale, Éducation routière',
        cb: 1,
        activities: ['Ed Psychomotrice', 'Éducation civique', 'Éducation morale', 'Éducation routière'],
        paliers: {
          1: 'B',
          2: 'A',
          3: 'A',
          4: 'A',
          5: 'A',
          6: 'A',
        },
      },
      {
        domain: '3 Éveil',
        competency: 'Activité manuelle (Dessin, Peinture), Ed. Music/chant, Éveil scientifique, Éveil techno, Ed. à la santé, Ed. à l\'environ',
        cb: 2,
        activities: ['Dessin', 'Peinture', 'Ed. Music/chant', 'Éveil scientifique', 'Éveil techno', 'Ed. à la santé', 'Ed. à l\'environ'],
        paliers: {
          1: 'B',
          2: 'A',
          3: 'A',
          4: 'A',
          5: 'A',
          6: 'A',
        },
      },
    ],
    generalAttitudes: [
      {
        label: 'Fréquentation scolaire',
        options: [
          { label: 'Régulière', checked: true },
          { label: 'Irrégulière', checked: false },
        ],
      },
      {
        label: 'Comportement en classe',
        options: [
          { label: 'Rêveur', checked: false },
          { label: 'Discipliné', checked: true },
          { label: 'Indiscipliné', checked: false },
        ],
      },
      {
        label: 'Comportement en récréation',
        options: [
          { label: 'Agressif', checked: false },
          { label: 'Turbulent', checked: false },
          { label: 'Calme', checked: true },
        ],
      },
      {
        label: 'Participation',
        options: [
          { label: 'Actif', checked: true },
          { label: 'Passif', checked: false },
        ],
      },
      {
        label: 'Degré d\'attention',
        options: [
          { label: 'Bon', checked: true },
          { label: 'Moyen', checked: false },
          { label: 'Faible', checked: false },
        ],
      },
      {
        label: 'Mémoire',
        options: [
          { label: 'Retient facilement et intelligemment', checked: false },
          { label: 'Retient', checked: false },
          { label: 'Retient pas', checked: true },
        ],
      },
      {
        label: 'Compréhension',
        options: [
          { label: 'Rapide et sûre', checked: false },
          { label: 'Lente et sûre', checked: true },
          { label: 'Difficile et peu sûre', checked: false },
        ],
      },
      {
        label: 'Rythme de travail',
        options: [
          { label: 'Rapide', checked: false },
          { label: 'Normal', checked: true },
          { label: 'Très lent', checked: false },
        ],
      },
      {
        label: 'Appréciation générale De l\'enseignant(e)',
        options: [
          { label: 'Autonome', checked: true },
          { label: 'Non autonome', checked: false },
        ],
      },
    ],
    remediations: {
      teacherAdvice: 'Élève qui progresse bien. Continuer à encourager la lecture.',
      socialService: false,
      psychologist: false,
      speechTherapist: false,
      ophthalmologist: false,
      dentist: false,
    },
    signatures: {
      parent: 'Signature parent',
      teacher: 'Signature enseignant',
      director: 'Signature directeur',
    },
  };
};

/**
 * Génère des données mock pour le Primaire
 */
const generatePrimaireMockData = () => {
  return {
    subjects: [
      {
        subject: 'EDM & EAS',
        competency: 'Compétence 1: Histoire, Géographie, Education à la citoyenneté',
        competencyNumber: 1,
        activities: ['C1', 'C2', 'C3'],
      },
      {
        subject: 'EDM & EAS',
        competency: 'Compétence 2: Biologie, Sciences physiques, Technologie, et TICE',
        competencyNumber: 2,
        activities: ['C1', 'C2', 'C3'],
      },
      {
        subject: 'EDM & EAS',
        competency: 'Compétence 3: Education physique et sportive et Education artistique',
        competencyNumber: 3,
        activities: ['C1', 'C2', 'C3'],
      },
      {
        subject: 'Français',
        competency: 'Compétence 1: Langage et Compréhension orale',
        competencyNumber: 1,
        activities: ['C1', 'C2', 'C3'],
      },
      {
        subject: 'Français',
        competency: 'Compétence 2: Lecture et Production écrite',
        competencyNumber: 2,
        activities: ['C1', 'C2', 'C3'],
      },
      {
        subject: 'Mathématiques',
        competency: 'Compétence 1: Nombres et opérations, Résolution des problèmes',
        competencyNumber: 1,
        activities: ['C1', 'C2', 'C3'],
      },
      {
        subject: 'Mathématiques',
        competency: 'Compétence 2: Géométrie et Mesure',
        competencyNumber: 2,
        activities: ['C1', 'C2', 'C3'],
      },
      {
        subject: 'Anglais',
        competency: 'Compétence 1: Langage et Compréhension orale',
        competencyNumber: 1,
        activities: ['C1', 'C2', 'C3'],
      },
      {
        subject: 'Anglais',
        competency: 'Compétence 2: Lecture et Production écrite',
        competencyNumber: 2,
        activities: ['C1', 'C2', 'C3'],
      },
    ],
    paliers: [1, 2, 3, 4, 5].map((palier) => ({
      palier,
      criteria: {
        'EDM & EAS': {
          'Compétence 1: Histoire, Géographie, Education à la citoyenneté': {
            C1: {
              criterionGrade: 7.5,
              competencyGrade: 7.8,
              competencyMastery: 'Min' as const,
              subjectMastery: 'Min' as const,
            },
            C2: {
              criterionGrade: 8.0,
            },
            C3: {
              criterionGrade: 8.2,
            },
          },
          'Compétence 2: Biologie, Sciences physiques, Technologie, et TICE': {
            C1: {
              criterionGrade: 7.0,
              competencyGrade: 7.3,
              competencyMastery: 'Min' as const,
              subjectMastery: 'Min' as const,
            },
            C2: {
              criterionGrade: 7.5,
            },
            C3: {
              criterionGrade: 7.4,
            },
          },
          'Compétence 3: Education physique et sportive et Education artistique': {
            C1: {
              criterionGrade: 8.5,
              competencyGrade: 8.6,
              competencyMastery: 'Max' as const,
              subjectMastery: 'Min' as const,
            },
            C2: {
              criterionGrade: 8.7,
            },
            C3: {
              criterionGrade: 8.6,
            },
          },
        },
        'Français': {
          'Compétence 1: Langage et Compréhension orale': {
            C1: {
              criterionGrade: 8.0,
              competencyGrade: 8.1,
              competencyMastery: 'Max' as const,
              subjectMastery: 'Min' as const,
            },
            C2: {
              criterionGrade: 8.2,
            },
            C3: {
              criterionGrade: 8.1,
            },
          },
          'Compétence 2: Lecture et Production écrite': {
            C1: {
              criterionGrade: 7.5,
              competencyGrade: 7.6,
              competencyMastery: 'Min' as const,
              subjectMastery: 'Min' as const,
            },
            C2: {
              criterionGrade: 7.7,
            },
            C3: {
              criterionGrade: 7.6,
            },
          },
        },
        'Mathématiques': {
          'Compétence 1: Nombres et opérations, Résolution des problèmes': {
            C1: {
              criterionGrade: 7.8,
              competencyGrade: 7.9,
              competencyMastery: 'Min' as const,
              subjectMastery: 'Min' as const,
            },
            C2: {
              criterionGrade: 8.0,
            },
            C3: {
              criterionGrade: 7.9,
            },
          },
          'Compétence 2: Géométrie et Mesure': {
            C1: {
              criterionGrade: 8.2,
              competencyGrade: 8.3,
              competencyMastery: 'Max' as const,
              subjectMastery: 'Min' as const,
            },
            C2: {
              criterionGrade: 8.4,
            },
            C3: {
              criterionGrade: 8.3,
            },
          },
        },
        'Anglais': {
          'Compétence 1: Langage et Compréhension orale': {
            C1: {
              criterionGrade: 7.0,
              competencyGrade: 7.2,
              competencyMastery: 'Min' as const,
              subjectMastery: 'Min' as const,
            },
            C2: {
              criterionGrade: 7.3,
            },
            C3: {
              criterionGrade: 7.3,
            },
          },
          'Compétence 2: Lecture et Production écrite': {
            C1: {
              criterionGrade: 7.1,
              competencyGrade: 7.2,
              competencyMastery: 'Min' as const,
              subjectMastery: 'Min' as const,
            },
            C2: {
              criterionGrade: 7.2,
            },
            C3: {
              criterionGrade: 7.3,
            },
          },
        },
      },
      edmFrenchMathMastery: 'Min' as const,
    })),
    exitProfile: {
      'EDM & EAS': {
        'Compétence 1: Histoire, Géographie, Education à la citoyenneté': {
          annualCompetencyGrade: 7.8,
          annualCompetencyMastery: 'Min' as const,
          annualSubjectMastery: 'Min' as const,
        },
        'Compétence 2: Biologie, Sciences physiques, Technologie, et TICE': {
          annualCompetencyGrade: 7.3,
          annualCompetencyMastery: 'Min' as const,
          annualSubjectMastery: 'Min' as const,
        },
        'Compétence 3: Education physique et sportive et Education artistique': {
          annualCompetencyGrade: 8.6,
          annualCompetencyMastery: 'Max' as const,
          annualSubjectMastery: 'Min' as const,
        },
      },
      'Français': {
        'Compétence 1: Langage et Compréhension orale': {
          annualCompetencyGrade: 8.1,
          annualCompetencyMastery: 'Max' as const,
          annualSubjectMastery: 'Min' as const,
        },
        'Compétence 2: Lecture et Production écrite': {
          annualCompetencyGrade: 7.6,
          annualCompetencyMastery: 'Min' as const,
          annualSubjectMastery: 'Min' as const,
        },
      },
      'Mathématiques': {
        'Compétence 1: Nombres et opérations, Résolution des problèmes': {
          annualCompetencyGrade: 7.9,
          annualCompetencyMastery: 'Min' as const,
          annualSubjectMastery: 'Min' as const,
        },
        'Compétence 2: Géométrie et Mesure': {
          annualCompetencyGrade: 8.3,
          annualCompetencyMastery: 'Max' as const,
          annualSubjectMastery: 'Min' as const,
        },
      },
      'Anglais': {
        'Compétence 1: Langage et Compréhension orale': {
          annualCompetencyGrade: 7.2,
          annualCompetencyMastery: 'Min' as const,
          annualSubjectMastery: 'Min' as const,
        },
        'Compétence 2: Lecture et Production écrite': {
          annualCompetencyGrade: 7.2,
          annualCompetencyMastery: 'Min' as const,
          annualSubjectMastery: 'Min' as const,
        },
      },
      edmFrenchMathAnnualMastery: 'Min' as const,
    },
    signatures: {
      parent: 'Signature parent',
      teacher: 'Signature enseignant',
      director: 'Signature directeur',
    },
    classDecision: 'Admis en classe supérieure',
  };
};

export const BulletinGenerator: React.FC<BulletinGeneratorProps> = ({
  student,
  academicYear = '2024-2025',
  teacherName,
  directorName,
  onClose,
  mode: initialMode = 'edit',
  bulletinId: providedBulletinId,
}) => {
  const { user } = useAuth();
  const level = student.class?.level || '';
  const isMaternelle = isMaternelleLevel(level);
  const bulletinType = isMaternelle ? 'MATERNELLE' : 'PRIMAIRE';

  // États
  const [mode, setMode] = useState<'edit' | 'preview'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bulletinId, setBulletinId] = useState<number | null>(providedBulletinId || null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bulletinData, setBulletinData] = useState<any>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishOnSave, setPublishOnSave] = useState(false);

  // Charger le bulletin existant
  useEffect(() => {
    const loadBulletin = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Si un bulletinId est fourni, charger directement ce bulletin
        if (providedBulletinId) {
          const bulletin = await bulletinService.getBulletin(providedBulletinId);
          setBulletinId(bulletin.id);
          setIsPublished(bulletin.isPublished);
          // S'assurer que les données sont bien parsées si c'est une string JSON
          if (typeof bulletin.data === 'string') {
            try {
              setBulletinData(JSON.parse(bulletin.data));
            } catch {
              setBulletinData(bulletin.data);
            }
          } else {
            setBulletinData(bulletin.data);
          }
          setLoading(false);
          return;
        }
        
        // Sinon, chercher parmi tous les bulletins de l'élève
        const bulletins = await bulletinService.getStudentBulletins(student.id, academicYear);
        const existing = bulletins.find((b) => b.type === bulletinType);
        if (existing) {
          setBulletinId(existing.id);
          setIsPublished(existing.isPublished);
          // S'assurer que les données sont bien parsées si c'est une string JSON
          if (typeof existing.data === 'string') {
            try {
              setBulletinData(JSON.parse(existing.data));
            } catch {
              setBulletinData(existing.data);
            }
          } else {
            setBulletinData(existing.data);
          }
        } else {
          // Initialiser avec les données mock seulement si on est en mode édition
          if (initialMode === 'edit') {
            if (isMaternelle) {
              setBulletinData(generateMaternelleMockData());
            } else {
              setBulletinData(generatePrimaireMockData());
            }
          }
        }
      } catch (err: unknown) {
        console.error('Erreur lors du chargement du bulletin:', err);
        // Initialiser avec les données mock seulement si on est en mode édition
        if (initialMode === 'edit') {
          if (isMaternelle) {
            setBulletinData(generateMaternelleMockData());
          } else {
            setBulletinData(generatePrimaireMockData());
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadBulletin();
  }, [student.id, academicYear, bulletinType, providedBulletinId, initialMode, isMaternelle]);

  const handleDataChange = (data: unknown) => {
    setBulletinData(data);
  };

  const handleSave = async (shouldPublish: boolean = false) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const dataToSave = {
        studentId: student.id,
        academicYear,
        type: bulletinType as 'MATERNELLE' | 'PRIMAIRE',
        data: bulletinData,
        isPublished: shouldPublish || publishOnSave,
      };

      if (bulletinId) {
        const updated = await bulletinService.updateBulletin(bulletinId, { 
          data: bulletinData,
          isPublished: shouldPublish || publishOnSave,
        });
        setIsPublished(updated.isPublished);
        setSuccess(updated.isPublished ? 'Bulletin mis à jour et publié avec succès' : 'Bulletin mis à jour avec succès');
      } else {
        const created = await bulletinService.createBulletin(dataToSave);
        setBulletinId(created.id);
        setIsPublished(created.isPublished);
        setSuccess(created.isPublished ? 'Bulletin enregistré et publié avec succès' : 'Bulletin enregistré avec succès');
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!bulletinId) {
      setError('Veuillez d\'abord enregistrer le bulletin');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setPublishing(true);
      setError(null);
      setSuccess(null);

      const updated = await bulletinService.publishBulletin(bulletinId);
      setIsPublished(updated.isPublished);
      setSuccess('Bulletin publié avec succès. Il est maintenant visible pour les parents.');

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la publication';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!bulletinId) {
      setError('Bulletin non trouvé');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setPublishing(true);
      setError(null);
      setSuccess(null);

      const updated = await bulletinService.unpublishBulletin(bulletinId);
      setIsPublished(updated.isPublished);
      setSuccess('Bulletin dépublié avec succès. Il n\'est plus visible pour les parents.');

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la dépublication';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setPublishing(false);
    }
  };

  // Déterminer si l'utilisateur peut éditer
  const canEdit = user?.role === 'ADMINISTRATION' || user?.role === 'SUPER_ADMIN';
  const isReadOnly = !canEdit || mode === 'preview';

  return (
    <div className="bulletin-generator">
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        .bulletin-generator {
          background: white;
        }
      `}</style>

      {/* Barre d'outils (masquée à l'impression) */}
      {canEdit && (
        <div className="no-print fixed top-4 right-4 z-50 flex flex-col gap-2 bg-white p-3 rounded-lg shadow-lg border border-gray-300 max-w-xs">
          {error && (
            <div className="text-red-600 text-sm px-2 py-1 bg-red-50 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm px-2 py-1 bg-green-50 rounded">
              {success}
            </div>
          )}
          
          {/* Statut de publication */}
          {bulletinId && (
            <div className="text-xs px-2 py-1 rounded bg-gray-100">
              Statut: <span className={isPublished ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
                {isPublished ? '✓ Publié' : '⚠ Non publié'}
              </span>
            </div>
          )}

          {/* Checkbox pour publier lors de l'enregistrement */}
          {mode === 'edit' && (
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={publishOnSave}
                onChange={(e) => setPublishOnSave(e.target.checked)}
                className="cursor-pointer"
              />
              <span className="text-gray-700">Publier immédiatement après l'enregistrement</span>
            </label>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
              className="border-blue-300 text-blue-700"
            >
              {mode === 'edit' ? '👁️ Aperçu' : '✏️ Édition'}
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(publishOnSave)}
              disabled={saving || mode === 'preview'}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {saving ? 'Enregistrement...' : '💾 Enregistrer'}
            </Button>
            
            {/* Bouton Publier/Dépublier */}
            {bulletinId && (
              <>
                {isPublished ? (
                  <Button
                    size="sm"
                    onClick={handleUnpublish}
                    disabled={publishing}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    title="Dépublier le bulletin (ne sera plus visible pour les parents)"
                  >
                    {publishing ? '...' : '🔒 Dépublier'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    title="Publier le bulletin (sera visible pour les parents)"
                  >
                    {publishing ? 'Publication...' : '📢 Publier'}
                  </Button>
                )}
              </>
            )}
            
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-red-300 text-red-700"
              >
                ✕ Fermer
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Page de garde (Verso) */}
      <BulletinCover
        studentName={student.lastName}
        studentFirstName={student.firstName}
        className={student.class?.name || ''}
        academicYear={academicYear}
        teacherName={teacherName}
        directorName={directorName}
      />

      {/* Bulletin selon le niveau */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-600">Chargement...</div>
        </div>
      ) : !bulletinData && mode === 'preview' ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Aucun bulletin disponible pour cet élève.</div>
        </div>
      ) : isMaternelle ? (
        <BulletinMaternelleEditable
          studentName={student.lastName}
          studentFirstName={student.firstName}
          className={student.class?.name || ''}
          academicYear={academicYear}
          initialData={bulletinData}
          onDataChange={handleDataChange}
          readOnly={isReadOnly}
        />
      ) : (
        <BulletinPrimaireEditable
          studentName={student.lastName}
          studentFirstName={student.firstName}
          className={student.class?.name || ''}
          academicYear={academicYear}
          subjects={generatePrimaireMockData().subjects}
          initialData={bulletinData}
          onDataChange={handleDataChange}
          readOnly={isReadOnly}
        />
      )}
    </div>
  );
};




