import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import * as studentService from '../../services/studentService';
import * as classService from '../../services/classService';
import { useLanguage } from '../../contexts/LanguageContext';

export const EditStudentPage = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const studentId = id ? parseInt(id, 10) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [student, setStudent] = useState<studentService.Student | null>(null);
  const [classes, setClasses] = useState<classService.Class[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    classId: '',
    schoolOfOrigin: '',
  });

  // Charger les données de l'élève et les classes
  useEffect(() => {
    const loadData = async () => {
      if (!studentId) {
        setError(t('students.invalidId') || 'ID élève invalide');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [studentData, classesData] = await Promise.all([
          studentService.getStudentById(studentId),
          classService.getClasses(),
        ]);

        setStudent(studentData);
        setClasses(classesData);

        // Formater la date pour l'input date
        const dateOfBirth = studentData.dateOfBirth
          ? new Date(studentData.dateOfBirth).toISOString().split('T')[0]
          : '';

        setFormData({
          firstName: studentData.firstName || '',
          lastName: studentData.lastName || '',
          dateOfBirth: dateOfBirth,
          classId: studentData.classId?.toString() || '',
          schoolOfOrigin: studentData.schoolOfOrigin || '',
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage || (t('students.loadError') || 'Erreur lors du chargement des données'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studentId, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updateData: Partial<studentService.CreateStudentData> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        classId: formData.classId ? parseInt(formData.classId, 10) : undefined,
        schoolOfOrigin: formData.schoolOfOrigin.trim() || undefined,
      };

      await studentService.updateStudent(studentId, updateData);

      setSuccess(t('students.updateSuccess') || 'Élève mis à jour avec succès');
      
      // Rediriger après 1.5 secondes
      setTimeout(() => {
        navigate('/admin/students');
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || (t('students.updateError') || 'Erreur lors de la mise à jour'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/students');
  };

  if (loading) {
    return (
      <AdminLayout
        title={t('students.editTitle') || 'Modifier un Élève'}
        subtitle={t('students.editSubtitle') || 'Modifier les informations de l\'élève'}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-blue-700">{t('common.loading') || 'Chargement...'}</div>
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout
        title={t('students.editTitle') || 'Modifier un Élève'}
        subtitle={t('students.editSubtitle') || 'Modifier les informations de l\'élève'}
      >
        <Card className="border-0 shadow-lg">
          <div className="py-12 text-center">
            <p className="text-red-600 font-semibold">
              {t('students.notFound') || 'Élève non trouvé'}
            </p>
            <Button
              variant="outline"
              className="mt-4 border-blue-400 text-blue-700 hover:bg-blue-50"
              onClick={handleCancel}
            >
              {t('common.back') || 'Retour'}
            </Button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t('students.editTitle') || 'Modifier un Élève'}
      subtitle={t('students.editSubtitle') || 'Modifier les informations de l\'élève'}
    >
      <ProtectedContent permission="students.update" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de modifier les élèves.
        </div>
      }>
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-700">
              {success}
            </div>
          )}

          <Card title={t('students.studentInfo') || 'Informations de l\'Élève'} className="border-0 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-blue-900" htmlFor="firstName">
                  {t('student.firstName') || 'Prénom'} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full"
                  placeholder={t('student.firstName') || 'Prénom'}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-blue-900" htmlFor="lastName">
                  {t('student.lastName') || 'Nom'} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full"
                  placeholder={t('student.lastName') || 'Nom'}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-blue-900" htmlFor="dateOfBirth">
                  {t('student.birthDate') || 'Date de naissance'} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-blue-900" htmlFor="classId">
                  {t('student.class') || 'Classe'} <span className="text-red-500">*</span>
                </label>
                <select
                  id="classId"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  required
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">{t('student.selectClass') || 'Sélectionner une classe'}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-blue-900" htmlFor="schoolOfOrigin">
                  {t('student.schoolOrigin') || 'École de provenance'}
                </label>
                <Input
                  id="schoolOfOrigin"
                  type="text"
                  value={formData.schoolOfOrigin}
                  onChange={(e) => setFormData({ ...formData, schoolOfOrigin: e.target.value })}
                  className="w-full"
                  placeholder={t('student.schoolOriginPlaceholder') || 'Nom de l\'école précédente'}
                />
              </div>
            </div>

            {/* Informations supplémentaires (lecture seule) */}
            <div className="mt-6 pt-6 border-t border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-4">
                {t('students.additionalInfo') || 'Informations supplémentaires'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">
                    {t('students.enrollmentDate') || 'Date d\'inscription'}:
                  </span>
                  <span className="ml-2 text-blue-900">
                    {student.enrollmentDate
                      ? new Date(student.enrollmentDate).toLocaleDateString('fr-FR')
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">
                    {t('students.parent') || 'Parent'}:
                  </span>
                  <span className="ml-2 text-blue-900">
                    {student.parent
                      ? `${student.parent.firstName} ${student.parent.lastName} (${student.parent.email})`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">
                    {t('students.currentClass') || 'Classe actuelle'}:
                  </span>
                  <span className="ml-2 text-blue-900">
                    {student.class ? `${student.class.name} (${student.class.level})` : '—'}
                  </span>
                </div>
              </div>
            </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-blue-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-blue-400 text-blue-700 hover:bg-blue-50"
                >
                  {t('common.cancel') || 'Annuler'}
                </Button>
                <ProtectedContent permission="students.update">
                  <Button
                    type="submit"
                    isLoading={saving}
                    className="bg-linear-to-r from-blue-600 via-blue-700 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {saving
                      ? t('common.saving') || 'Enregistrement...'
                      : t('common.save') || 'Enregistrer les modifications'}
                  </Button>
                </ProtectedContent>
              </div>
            </form>
          </Card>
        </div>
      </ProtectedContent>
    </AdminLayout>
  );
};









