import { useState, useEffect } from "react";
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useLanguage } from '../../contexts/LanguageContext';
import * as assignmentService from '../../services/assignmentService';
import * as classService from '../../services/classService';
import * as subjectService from '../../services/subjectService';

interface ClassOption {
  id: number;
  name: string;
}

interface SubjectOption {
  id: number;
  name: string;
}

export function CahierExo() {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [intitule, setIntitule] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [assignments, setAssignments] = useState<assignmentService.Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger les classes et matières au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, subjectsData, assignmentsData] = await Promise.all([
        classService.getMyClasses(), // Utiliser getMyClasses() pour charger uniquement les classes où l'enseignant enseigne
        subjectService.getSubjects(),
        assignmentService.getTeacherAssignments(),
      ]);
      setClasses(classesData);
      setSubjects(subjectsData);
      setAssignments(assignmentsData);
      if (classesData.length > 0) {
        setSelectedClassId(classesData[0].id);
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !intitule.trim()) {
      setError('La classe et l\'intitulé sont requis');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // TODO: Upload du fichier si nécessaire (pour l'instant, on passe null)
      const documentUrl = documentFile ? null : null; // À implémenter avec un service d'upload

      await assignmentService.createAssignment({
        classId: Number(selectedClassId),
        subjectId: selectedSubjectId ? Number(selectedSubjectId) : undefined,
        title: intitule.trim(),
        description: description.trim() || undefined,
        documentUrl: documentUrl || undefined,
        dueDate: dueDate || undefined,
      });

      setSuccess(t("teacher.exerciseSaved") || 'Exercice enregistré avec succès!');
      setIntitule('');
      setDescription('');
      setDueDate('');
      setDocumentFile(null);
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout 
      title={t("teacher.exerciseBook") || "Mon Cahier d'exercice"} 
      subtitle={t("teacher.createManageExercises") || "Créer et gérer vos exercices"}
      actions={
        <Button 
          onClick={() => alert(t("teacher.saveAllExercises") || 'Enregistrement de tous les exercices')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-semibold px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 shadow-lg"
        >
          {t("teacher.saveAllExercises") || "Enregistrer chacun de vos exercices"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Sélection Classe et Matière */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">{t("teacher.class") || "Classe"} :</label>
              <select
                title={t("teacher.selectClass") || "Sélectionner la classe"}
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-gray-700 dark:to-gray-800 text-blue-900 dark:text-blue-400 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                disabled={loading}
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(classe => (
                  <option key={classe.id} value={classe.id}>{classe.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">{t("teacher.subject") || "Matière"} :</label>
              <select
                title={t("teacher.selectSubject") || "Sélectionner la matière"}
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-gray-700 dark:to-gray-800 text-blue-900 dark:text-blue-400 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                disabled={loading}
              >
                <option value="">Sélectionner une matière (optionnel)</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Card Paramètres */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-700">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-3 mb-4 rounded-t-lg">
              <h3 className="text-white font-bold text-center">{t("teacher.settings") || "Paramètres"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">{t("teacher.title") || "Intitulé"} :</label>
                <input
                  type="text"
                  value={intitule}
                  onChange={(e) => setIntitule(e.target.value)}
                  placeholder={t("teacher.titlePlaceholder") || "Géologie"}
                  className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-gray-700 dark:to-gray-800 text-blue-900 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">{t("teacher.description") || "Description"} :</label>
                <textarea
                  title={t("teacher.description") || "Description"}
                  placeholder={t("teacher.description") || "Description"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">{t("teacher.document") || "Document"} :</label>
                <input
                  title={t("teacher.document") || "Document"}
                  placeholder={t("teacher.document") || "Document"}
                  type="file"
                  className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-gray-700 dark:to-gray-800 text-blue-900 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">{t("teacher.date") || "Date limite"} :</label>
                <input
                  title={t("teacher.date") || "Date limite"}
                  placeholder={t("teacher.date") || "Date limite"}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                disabled={saving || !selectedClassId || !intitule.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 shadow-lg disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : (t("common.submit") || "Enregistrer")}
              </Button>
            </form>
          </Card>
        </div>

        {/* Colonne droite */}
        <div>
          <Card className="border-0 shadow-lg dark:bg-gray-800 h-full">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-700 px-6 py-4 rounded-t-lg">
              <h3 className="text-blue-900 dark:text-blue-100 font-bold text-center">{t("teacher.recentAssignments") || "Vos Récents Devoirs"}</h3>
            </div>
            <div className="p-6 min-h-[350px] bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
              {loading ? (
                <p className="text-center text-blue-600 dark:text-blue-400 mt-8">Chargement...</p>
              ) : assignments.length === 0 ? (
                <p className="text-center text-blue-600 dark:text-blue-400 mt-8">{t("teacher.noRecentAssignments") || "Aucun devoir récent"}</p>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 5).map(assignment => (
                    <div key={assignment.id} className="border border-blue-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                      <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-400">{assignment.title}</h4>
                      <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">{assignment.class.name}</p>
                      {assignment.subject && (
                        <p className="text-xs text-blue-600/60 dark:text-blue-400/60">{assignment.subject.name}</p>
                      )}
                      {assignment.dueDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Échéance: {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default CahierExo;
