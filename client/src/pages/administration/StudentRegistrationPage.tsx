import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import * as studentService from '../../services/studentService';
import * as parentService from '../../services/parentService';
import * as classService from '../../services/classService';
import { useLanguage } from '../../contexts/LanguageContext';

export const StudentRegistrationPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Détecter d'où on vient pour rediriger vers le bon dashboard
  const getReturnPath = () => {
    // Si on vient de la route superadmin, retourner vers superadmin
    if (location.pathname.startsWith('/superadmin')) {
      return '/superadmin';
    }
    // Sinon, retourner vers admin
    return '/admin';
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [foundParent, setFoundParent] = useState<parentService.Parent | null>(null);

  const [classes, setClasses] = useState<classService.Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  const [formData, setFormData] = useState({
    // Informations élève
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    classId: '',
    schoolOfOrigin: '',
    
    // Handicap et orphelin
    hasDisability: false,
    disabilityDescription: '',
    isOrphan: false,
    orphanType: '',
    
    // Parents
    fatherName: '',
    fatherAddress: '',
    fatherContact: '',
    motherName: '',
    motherAddress: '',
    motherContact: '',
    
    // Tuteur
    guardianName: '',
    guardianContact: '',
    
    // Personnes autorisées a venir prendre l'enfant
    authorizedPerson1Name: '',
    authorizedPerson1Tel: '',
    authorizedPerson2Name: '',
    authorizedPerson2Tel: '',
    
    // Option de paiement
    paymentOption: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
    
    // Parent pour association
    parentEmail: '',
  });

  const [isSearchParentModalOpen, setIsSearchParentModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Charger les classes au montage du composant
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const fetchedClasses = await classService.getClasses();
        setClasses(fetchedClasses);
        
        // Si aucune classe n'existe, créer les classes prédéfinies
        if (fetchedClasses.length === 0) {
          const predefinedClasses = [
            { name: 'Maternelle', level: 'Maternelle' },
            { name: 'Pré-primaire', level: 'Pré-primaire' },
            { name: 'CP', level: 'Primaire' },
            { name: 'CE1', level: 'Primaire' },
            { name: 'CE2', level: 'Primaire' },
            { name: 'CM1', level: 'Primaire' },
            { name: 'CM2', level: 'Primaire' },
          ];
          
          const createdClasses = await Promise.all(
            predefinedClasses.map(cls => classService.findOrCreateClass(cls))
          );
          setClasses(createdClasses);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des classes:', err);
        setError('Erreur lors du chargement des classes');
      } finally {
        setIsLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Préparer les données pour l'API
      const studentData: studentService.CreateStudentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        classId: formData.classId ? parseInt(formData.classId) : undefined,
        schoolOfOrigin: formData.schoolOfOrigin || undefined,
        hasDisability: formData.hasDisability,
        disabilityDescription: formData.hasDisability ? formData.disabilityDescription : undefined,
        isOrphan: formData.isOrphan,
        orphanType: formData.orphanType || undefined,
        fatherName: formData.fatherName || undefined,
        fatherAddress: formData.fatherAddress || undefined,
        fatherContact: formData.fatherContact || undefined,
        motherName: formData.motherName || undefined,
        motherAddress: formData.motherAddress || undefined,
        motherContact: formData.motherContact || undefined,
        guardianName: formData.guardianName || undefined,
        guardianContact: formData.guardianContact || undefined,
        authorizedPerson1Name: formData.authorizedPerson1Name || undefined,
        authorizedPerson1Tel: formData.authorizedPerson1Tel || undefined,
        authorizedPerson2Name: formData.authorizedPerson2Name || undefined,
        authorizedPerson2Tel: formData.authorizedPerson2Tel || undefined,
        paymentOption: formData.paymentOption,
        parentEmail: formData.parentEmail,
      };

      const response = await studentService.createStudent(studentData);

      setSuccess(`Élève créé avec succès ! ${response.parent.wasCreated ? 'Un compte parent a été créé automatiquement.' : 'Parent existant associé.'}`);
      
      // Réinitialiser le formulaire
      setFormData({
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
        paymentOption: 'MONTHLY',
        parentEmail: '',
      });

      // Rediriger après 2 secondes vers le bon dashboard
      setTimeout(() => {
        navigate(getReturnPath());
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'élève';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchParent = async () => {
    if (!searchEmail) {
      setError('Veuillez entrer un email');
      return;
    }

    setIsSearching(true);
    setError(null);
    setFoundParent(null);

    try {
      const parent = await parentService.searchParent(searchEmail);
      setFoundParent(parent);
      
      // Auto-remplir le formulaire avec les informations du parent trouvé
      // Utiliser les informations du premier enfant si disponibles
      const parentInfo = (parent as any).parentInfo;
      
      setFormData(prev => ({
        ...prev,
        parentEmail: parent.email,
        // Remplir les informations parentales depuis le premier enfant
        ...(parentInfo && {
          fatherName: parentInfo.fatherName || prev.fatherName,
          fatherAddress: parentInfo.fatherAddress || prev.fatherAddress,
          fatherContact: parentInfo.fatherContact || prev.fatherContact,
          motherName: parentInfo.motherName || prev.motherName,
          motherAddress: parentInfo.motherAddress || prev.motherAddress,
          motherContact: parentInfo.motherContact || prev.motherContact,
          guardianName: parentInfo.guardianName || prev.guardianName,
          guardianContact: parentInfo.guardianContact || prev.guardianContact,
          authorizedPerson1Name: parentInfo.authorizedPerson1Name || prev.authorizedPerson1Name,
          authorizedPerson1Tel: parentInfo.authorizedPerson1Tel || prev.authorizedPerson1Tel,
          authorizedPerson2Name: parentInfo.authorizedPerson2Name || prev.authorizedPerson2Name,
          authorizedPerson2Tel: parentInfo.authorizedPerson2Tel || prev.authorizedPerson2Tel,
        }),
      }));
      
      setIsSearchParentModalOpen(false);
      setSearchEmail('');
      setSuccess(`Parent trouvé : ${parent.firstName} ${parent.lastName}. Les informations ont été pré-remplies.`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      if (errorMessage.includes('non trouvé')) {
        // Parent non trouvé, on continue quand même (sera créé automatiquement)
        setFormData({ ...formData, parentEmail: searchEmail });
        setIsSearchParentModalOpen(false);
        setSearchEmail('');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('student.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('student.subtitle')}</p>
          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
              {success}
            </div>
          )}

          {foundParent && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-lg">
              <p className="font-semibold">Parent trouvé :</p>
              <p>{foundParent.firstName} {foundParent.lastName} ({foundParent.email})</p>
              {foundParent.students && foundParent.students.length > 0 && (
                <p className="text-sm mt-1">A déjà {foundParent.students.length} enfant(s) inscrit(s)</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Card className="mb-6 border-0 shadow-lg dark:bg-gray-800">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-6 py-4 rounded-t-lg mb-4">
                <h3 className="text-blue-900 dark:text-blue-900 font-bold text-xl text-center">{t('student.studentInfo')}</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('student.firstName')}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label={t('student.lastName')}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('student.birthDate')}
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('student.class')}</label>
                    <select
                      aria-label={t('student.class')}
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      disabled={isLoadingClasses}
                    >
                      <option value="">{isLoadingClasses ? t('student.loadingClasses') : t('student.selectClass')}</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id.toString()}>
                          {cls.name} {cls.level ? `(${cls.level})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label={t('student.schoolOrigin')}
                  value={formData.schoolOfOrigin}
                  onChange={(e) => setFormData({ ...formData, schoolOfOrigin: e.target.value })}
                  placeholder={t('student.schoolOriginPlaceholder')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('student.disability')}</label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-gray-900 dark:text-white">
                        <input
                          type="radio"
                          name="hasDisability"
                          checked={formData.hasDisability === true}
                          onChange={() => setFormData({ ...formData, hasDisability: true, disabilityDescription: formData.hasDisability ? formData.disabilityDescription : '' })}
                          className="mr-2"
                        />
                        {t('common.yes')}
                      </label>
                      <label className="flex items-center text-gray-900 dark:text-white">
                        <input
                          type="radio"
                          name="hasDisability"
                          checked={formData.hasDisability === false}
                          onChange={() => setFormData({ ...formData, hasDisability: false, disabilityDescription: '' })}
                          className="mr-2"
                        />
                        {t('common.no')}
                      </label>
                    </div>
                    {formData.hasDisability && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('student.disabilityDescription')}
                        </label>
                        <textarea
                          value={formData.disabilityDescription}
                          onChange={(e) => setFormData({ ...formData, disabilityDescription: e.target.value })}
                          placeholder={t('student.disabilityPlaceholder')}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('student.orphan')}</label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-gray-900 dark:text-white">
                        <input
                          type="radio"
                          name="isOrphan"
                          checked={formData.isOrphan === true}
                          onChange={() => setFormData({ ...formData, isOrphan: true })}
                          className="mr-2"
                        />
                        {t('common.yes')}
                      </label>
                      <label className="flex items-center text-gray-900 dark:text-white">
                        <input
                          type="radio"
                          name="isOrphan"
                          checked={formData.isOrphan === false}
                          onChange={() => setFormData({ ...formData, isOrphan: false })}
                          className="mr-2"
                        />
                        {t('common.no')}
                      </label>
                    </div>
                  </div>
                </div>

                {formData.isOrphan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('student.orphanType')}</label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-gray-900 dark:text-white">
                        <input
                          type="radio"
                          name="orphanType"
                          value="Père"
                          checked={formData.orphanType === 'Père'}
                          onChange={(e) => setFormData({ ...formData, orphanType: e.target.value })}
                          className="mr-2"
                        />
                        {t('student.father')}
                      </label>
                      <label className="flex items-center text-gray-900 dark:text-white">
                        <input
                          type="radio"
                          name="orphanType"
                          value="Mère"
                          checked={formData.orphanType === 'Mère'}
                          onChange={(e) => setFormData({ ...formData, orphanType: e.target.value })}
                          className="mr-2"
                        />
                        {t('student.mother')}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="mb-6 border-0 shadow-lg dark:bg-gray-800">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-6 py-4 rounded-t-lg mb-4">
                <h3 className="text-blue-900 dark:text-blue-900 font-bold text-xl text-center">{t('student.parentInfo')}</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('student.father')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('student.fatherName')}
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    />
                    <Input
                      label={t('student.fatherContact')}
                      value={formData.fatherContact}
                      onChange={(e) => setFormData({ ...formData, fatherContact: e.target.value })}
                    />
                  </div>
                  <Input
                    label={t('student.fatherAddress')}
                    value={formData.fatherAddress}
                    onChange={(e) => setFormData({ ...formData, fatherAddress: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('student.mother')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('student.motherName')}
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    />
                    <Input
                      label={t('student.motherContact')}
                      value={formData.motherContact}
                      onChange={(e) => setFormData({ ...formData, motherContact: e.target.value })}
                    />
                  </div>
                  <Input
                    label={t('student.motherAddress')}
                    value={formData.motherAddress}
                    onChange={(e) => setFormData({ ...formData, motherAddress: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('student.guardian')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('student.guardianName')}
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    />
                    <Input
                      label={t('student.guardianContact')}
                      value={formData.guardianContact}
                      onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="mb-6 border-0 shadow-lg dark:bg-gray-800">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-6 py-4 rounded-t-lg mb-4">
                <h3 className="text-blue-900 dark:text-blue-900 font-bold text-xl text-center">{t('student.authorizedPersons')}</h3>
              </div>
              <div className="space-y-4">
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

            <Card className="mb-6 border-0 shadow-lg dark:bg-gray-800">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-6 py-4 rounded-t-lg mb-4">
                <h3 className="text-blue-900 dark:text-blue-900 font-bold text-xl text-center">{t('student.paymentOption')}</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="MONTHLY"
                    checked={formData.paymentOption === 'MONTHLY'}
                    onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold dark:text-white">{t('student.option1')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('student.option1Desc')}</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="QUARTERLY"
                    checked={formData.paymentOption === 'QUARTERLY'}
                    onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold dark:text-white">{t('student.option2')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('student.option2Desc')}</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="ANNUAL"
                    checked={formData.paymentOption === 'ANNUAL'}
                    onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold dark:text-white">{t('student.option3')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('student.option3Desc')}</p>
                  </div>
                </label>
              </div>
            </Card>

            <Card className="mb-6 border-0 shadow-lg dark:bg-gray-800">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-6 py-4 rounded-t-lg mb-4">
                <h3 className="text-blue-900 dark:text-blue-900 font-bold text-xl text-center">{t('student.parentAssociation')}</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('student.parentSearchDesc')}
                </p>
                <div className="flex gap-3">
                  <Input
                    label={t('student.parentEmail')}
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder={t('student.parentEmailPlaceholder')}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSearchParentModalOpen(true)}
                    className="mt-7"
                  >
                    {t('student.search')}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('student.parentAutoCreate')}
                </p>
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(getReturnPath())}>
                {t('student.cancel')}
              </Button>
              <Button type="submit" style={{ backgroundColor: '#fbbf24' }} disabled={isLoading}>
                {isLoading ? t('student.saving') : t('student.save')}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal de recherche de parent */}
      <Modal
        isOpen={isSearchParentModalOpen}
        onClose={() => setIsSearchParentModalOpen(false)}
        title={t('student.searchParent')}
      >
        <div className="space-y-4">
          <Input
            label={t('student.parentEmail')}
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder={t('student.parentEmailPlaceholder')}
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSearchParentModalOpen(false)}
            >
              {t('student.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSearchParent}
              style={{ backgroundColor: '#fbbf24' }}
              disabled={isSearching}
            >
              {isSearching ? t('student.searching') : t('student.search')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

