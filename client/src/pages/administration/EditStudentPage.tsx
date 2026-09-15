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
  const [initialClassId, setInitialClassId] = useState<string>('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    classId: '',
    schoolOfOrigin: '',
    hasDisability: false,
    disabilityDescription: '',
    isOrphan: false,
    orphanType: '',
    fatherName: '',
    fatherAddress: '',
    fatherContact: '',
    motherName: '',
    motherAddress: '',
    motherContact: '',
    guardianName: '',
    guardianContact: '',
    authorizedPerson1Name: '',
    authorizedPerson1Tel: '',
    authorizedPerson2Name: '',
    authorizedPerson2Tel: '',
    paymentOption: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
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

        const classIdStr = studentData.classId?.toString() || '';
        setInitialClassId(classIdStr);

        setFormData({
          firstName: studentData.firstName || '',
          lastName: studentData.lastName || '',
          dateOfBirth,
          classId: classIdStr,
          schoolOfOrigin: studentData.schoolOfOrigin || '',
          hasDisability: studentData.hasDisability || false,
          disabilityDescription: studentData.disabilityDescription || '',
          isOrphan: studentData.isOrphan || false,
          orphanType: studentData.orphanType || '',
          fatherName: studentData.fatherName || '',
          fatherAddress: studentData.fatherAddress || '',
          fatherContact: studentData.fatherContact || '',
          motherName: studentData.motherName || '',
          motherAddress: studentData.motherAddress || '',
          motherContact: studentData.motherContact || '',
          guardianName: studentData.guardianName || '',
          guardianContact: studentData.guardianContact || '',
          authorizedPerson1Name: studentData.authorizedPerson1Name || '',
          authorizedPerson1Tel: studentData.authorizedPerson1Tel || '',
          authorizedPerson2Name: studentData.authorizedPerson2Name || '',
          authorizedPerson2Tel: studentData.authorizedPerson2Tel || '',
          paymentOption: studentData.paymentOption || 'MONTHLY',
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
        hasDisability: formData.hasDisability,
        disabilityDescription: formData.hasDisability ? formData.disabilityDescription.trim() || undefined : undefined,
        isOrphan: formData.isOrphan,
        orphanType: formData.isOrphan ? formData.orphanType || undefined : undefined,
        fatherName: formData.fatherName.trim() || undefined,
        fatherAddress: formData.fatherAddress.trim() || undefined,
        fatherContact: formData.fatherContact.trim() || undefined,
        motherName: formData.motherName.trim() || undefined,
        motherAddress: formData.motherAddress.trim() || undefined,
        motherContact: formData.motherContact.trim() || undefined,
        guardianName: formData.guardianName.trim() || undefined,
        guardianContact: formData.guardianContact.trim() || undefined,
        authorizedPerson1Name: formData.authorizedPerson1Name.trim() || undefined,
        authorizedPerson1Tel: formData.authorizedPerson1Tel.trim() || undefined,
        authorizedPerson2Name: formData.authorizedPerson2Name.trim() || undefined,
        authorizedPerson2Tel: formData.authorizedPerson2Tel.trim() || undefined,
        paymentOption: formData.paymentOption,
      };

      await studentService.updateStudent(studentId, updateData);

      const classChanged = formData.classId !== initialClassId;
      setSuccess(
        classChanged
          ? (t('students.updateSuccessWithClassChange') || 'Élève mis à jour avec succès (changement de classe pris en compte)')
          : (t('students.updateSuccess') || 'Élève mis à jour avec succès')
      );

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

          {student.isArchived && (
            <div className="p-4 rounded-xl border border-gray-300 bg-gray-50 text-gray-700">
              Cet élève est actuellement archivé. Vous pouvez le désarchiver depuis la liste des élèves.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <Card title={t('student.studentInfo') || 'Informations de l\'Élève'} className="border-0 shadow-lg">
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
                  {formData.classId !== initialClassId && (
                    <p className="text-xs text-yellow-700">
                      Changement de classe détecté (ex. passage à la classe supérieure) — sera appliqué à l'enregistrement.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-medium text-blue-900" htmlFor="schoolOfOrigin">
                    {t('student.schoolOrigin') || 'École de provenance'}
                  </label>
                  <Input
                    id="schoolOfOrigin"
                    type="text"
                    value={formData.schoolOfOrigin}
                    onChange={(e) => setFormData({ ...formData, schoolOfOrigin: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">{t('student.disability') || 'Handicap'}</label>
                  <div className="flex gap-4">
                    <label className="flex items-center text-blue-900">
                      <input
                        type="radio"
                        name="hasDisability"
                        checked={formData.hasDisability === true}
                        onChange={() => setFormData({ ...formData, hasDisability: true })}
                        className="mr-2"
                      />
                      {t('common.yes') || 'Oui'}
                    </label>
                    <label className="flex items-center text-blue-900">
                      <input
                        type="radio"
                        name="hasDisability"
                        checked={formData.hasDisability === false}
                        onChange={() => setFormData({ ...formData, hasDisability: false, disabilityDescription: '' })}
                        className="mr-2"
                      />
                      {t('common.no') || 'Non'}
                    </label>
                  </div>
                  {formData.hasDisability && (
                    <textarea
                      value={formData.disabilityDescription}
                      onChange={(e) => setFormData({ ...formData, disabilityDescription: e.target.value })}
                      placeholder={t('student.disabilityPlaceholder') || 'Description du handicap'}
                      rows={2}
                      className="mt-2 w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-blue-900"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">{t('student.orphan') || 'Orphelin'}</label>
                  <div className="flex gap-4">
                    <label className="flex items-center text-blue-900">
                      <input
                        type="radio"
                        name="isOrphan"
                        checked={formData.isOrphan === true}
                        onChange={() => setFormData({ ...formData, isOrphan: true })}
                        className="mr-2"
                      />
                      {t('common.yes') || 'Oui'}
                    </label>
                    <label className="flex items-center text-blue-900">
                      <input
                        type="radio"
                        name="isOrphan"
                        checked={formData.isOrphan === false}
                        onChange={() => setFormData({ ...formData, isOrphan: false, orphanType: '' })}
                        className="mr-2"
                      />
                      {t('common.no') || 'Non'}
                    </label>
                  </div>
                  {formData.isOrphan && (
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center text-blue-900">
                        <input
                          type="radio"
                          name="orphanType"
                          value="Père"
                          checked={formData.orphanType === 'Père'}
                          onChange={(e) => setFormData({ ...formData, orphanType: e.target.value })}
                          className="mr-2"
                        />
                        {t('student.father') || 'Père'}
                      </label>
                      <label className="flex items-center text-blue-900">
                        <input
                          type="radio"
                          name="orphanType"
                          value="Mère"
                          checked={formData.orphanType === 'Mère'}
                          onChange={(e) => setFormData({ ...formData, orphanType: e.target.value })}
                          className="mr-2"
                        />
                        {t('student.mother') || 'Mère'}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Parents / Tuteur */}
            <Card title={t('student.parentInfo') || 'Informations sur les parents'} className="border-0 shadow-lg">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">{t('student.father') || 'Père'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('student.fatherName') || 'Nom du père'}
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    />
                    <Input
                      label={t('student.fatherContact') || 'Contact du père'}
                      value={formData.fatherContact}
                      onChange={(e) => setFormData({ ...formData, fatherContact: e.target.value })}
                    />
                  </div>
                  <Input
                    label={t('student.fatherAddress') || 'Adresse du père'}
                    value={formData.fatherAddress}
                    onChange={(e) => setFormData({ ...formData, fatherAddress: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">{t('student.mother') || 'Mère'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('student.motherName') || 'Nom de la mère'}
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    />
                    <Input
                      label={t('student.motherContact') || 'Contact de la mère'}
                      value={formData.motherContact}
                      onChange={(e) => setFormData({ ...formData, motherContact: e.target.value })}
                    />
                  </div>
                  <Input
                    label={t('student.motherAddress') || 'Adresse de la mère'}
                    value={formData.motherAddress}
                    onChange={(e) => setFormData({ ...formData, motherAddress: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">{t('student.guardian') || 'Tuteur'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('student.guardianName') || 'Nom du tuteur'}
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    />
                    <Input
                      label={t('student.guardianContact') || 'Contact du tuteur'}
                      value={formData.guardianContact}
                      onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Personnes autorisées */}
            <Card title={t('student.authorizedPersons') || 'Personnes autorisées à récupérer l\'élève'} className="border-0 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="1. Nom"
                    value={formData.authorizedPerson1Name}
                    onChange={(e) => setFormData({ ...formData, authorizedPerson1Name: e.target.value })}
                  />
                  <Input
                    label="Téléphone"
                    value={formData.authorizedPerson1Tel}
                    onChange={(e) => setFormData({ ...formData, authorizedPerson1Tel: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Input
                    label="2. Nom"
                    value={formData.authorizedPerson2Name}
                    onChange={(e) => setFormData({ ...formData, authorizedPerson2Name: e.target.value })}
                  />
                  <Input
                    label="Téléphone"
                    value={formData.authorizedPerson2Tel}
                    onChange={(e) => setFormData({ ...formData, authorizedPerson2Tel: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            {/* Option de paiement */}
            <Card title={t('student.paymentOption') || 'Mode d\'inscription / paiement'} className="border-0 shadow-lg">
              <select
                aria-label={t('student.paymentOption') || 'Mode de paiement'}
                value={formData.paymentOption}
                onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' })}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="MONTHLY">Mensuel</option>
                <option value="QUARTERLY">Trimestriel</option>
                <option value="ANNUAL">Annuel (1 ou 2 tranches)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Ce changement ne régénère pas automatiquement l'échéancier de frais déjà créé pour l'année en
                cours — utilisez la page « Frais de Scolarité » pour ajuster les paiements existants si besoin.
              </p>
            </Card>

            {/* Informations supplémentaires (lecture seule) */}
            <Card title={t('students.additionalInfo') || 'Informations supplémentaires'} className="border-0 shadow-lg">
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
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Pour changer le parent associé, utilisez la page « Association Parents ».
              </p>
            </Card>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-4 pt-2">
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
        </div>
      </ProtectedContent>
    </AdminLayout>
  );
};
