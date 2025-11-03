import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import * as studentService from '../../services/studentService';
import * as parentService from '../../services/parentService';

export const StudentRegistrationPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [foundParent, setFoundParent] = useState<parentService.Parent | null>(null);

  const [formData, setFormData] = useState({
    // Informations élève
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    class: '',
    schoolOfOrigin: '',
    
    // Handicap et orphelin
    hasDisability: false,
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
    
    // Personnes autorisées
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
        classId: formData.class ? parseInt(formData.class) : undefined,
        schoolOfOrigin: formData.schoolOfOrigin || undefined,
        hasDisability: formData.hasDisability,
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
        class: '',
        schoolOfOrigin: '',
        hasDisability: false,
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

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/admin');
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
      setFormData({ ...formData, parentEmail: parent.email });
      setIsSearchParentModalOpen(false);
      setSearchEmail('');
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fiche d'Inscription d'un Élève</h1>
            <p className="text-gray-600">Remplissez toutes les informations pour inscrire un nouvel élève</p>
          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {foundParent && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
              <p className="font-semibold">Parent trouvé :</p>
              <p>{foundParent.firstName} {foundParent.lastName} ({foundParent.email})</p>
              {foundParent.students && foundParent.students.length > 0 && (
                <p className="text-sm mt-1">A déjà {foundParent.students.length} enfant(s) inscrit(s)</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Card title="Informations de l'Élève" className="mb-6 border-0 shadow-lg">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Nom"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date de naissance"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
                    <select
                      aria-label="Classe"
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionner une classe</option>
                      <option value="pre-primaire">Pré-primaire</option>
                      <option value="cp">CP</option>
                      <option value="ce1">CE1</option>
                      <option value="ce2">CE2</option>
                      <option value="cm1">CM1</option>
                      <option value="cm2">CM2</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="École de provenance"
                  value={formData.schoolOfOrigin}
                  onChange={(e) => setFormData({ ...formData, schoolOfOrigin: e.target.value })}
                  placeholder="Nom de l'école précédente"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Handicap</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasDisability"
                          checked={formData.hasDisability === true}
                          onChange={() => setFormData({ ...formData, hasDisability: true })}
                          className="mr-2"
                        />
                        Oui
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasDisability"
                          checked={formData.hasDisability === false}
                          onChange={() => setFormData({ ...formData, hasDisability: false })}
                          className="mr-2"
                        />
                        Non
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Orphelin</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isOrphan"
                          checked={formData.isOrphan === true}
                          onChange={() => setFormData({ ...formData, isOrphan: true })}
                          className="mr-2"
                        />
                        Oui
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isOrphan"
                          checked={formData.isOrphan === false}
                          onChange={() => setFormData({ ...formData, isOrphan: false })}
                          className="mr-2"
                        />
                        Non
                      </label>
                    </div>
                  </div>
                </div>

                {formData.isOrphan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="orphanType"
                          value="Père"
                          checked={formData.orphanType === 'Père'}
                          onChange={(e) => setFormData({ ...formData, orphanType: e.target.value })}
                          className="mr-2"
                        />
                        Père
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="orphanType"
                          value="Mère"
                          checked={formData.orphanType === 'Mère'}
                          onChange={(e) => setFormData({ ...formData, orphanType: e.target.value })}
                          className="mr-2"
                        />
                        Mère
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Informations sur les Parents" className="mb-6 border-0 shadow-lg">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Père</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nom"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    />
                    <Input
                      label="Contact"
                      value={formData.fatherContact}
                      onChange={(e) => setFormData({ ...formData, fatherContact: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Domicile"
                    value={formData.fatherAddress}
                    onChange={(e) => setFormData({ ...formData, fatherAddress: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Mère</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nom"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    />
                    <Input
                      label="Contact"
                      value={formData.motherContact}
                      onChange={(e) => setFormData({ ...formData, motherContact: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Domicile"
                    value={formData.motherAddress}
                    onChange={(e) => setFormData({ ...formData, motherAddress: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tuteur/Tutrice</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nom"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    />
                    <Input
                      label="Contact"
                      value={formData.guardianContact}
                      onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Personnes Autorisées" className="mb-6 border-0 shadow-lg">
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

            <Card title="Option de Paiement" className="mb-6 border-0 shadow-lg">
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="MONTHLY"
                    checked={formData.paymentOption === 'MONTHLY'}
                    onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold">Option 1 : Tous les mois (le 5 du mois)</p>
                    <p className="text-sm text-gray-600">Dernière échéance le 05 MARS 2026</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="QUARTERLY"
                    checked={formData.paymentOption === 'QUARTERLY'}
                    onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold">Option 2 : Tous les trimestres</p>
                    <p className="text-sm text-gray-600">Dernière échéance le 05 MARS 2026</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="ANNUAL"
                    checked={formData.paymentOption === 'ANNUAL'}
                    onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold">Option 3 : Une ou deux tranches (scolarité annuelle)</p>
                    <p className="text-sm text-gray-600">Dernière échéance le 05 MARS 2026</p>
                  </div>
                </label>
              </div>
            </Card>

            <Card title="Association à un Compte Parent" className="mb-6 border-0 shadow-lg">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Recherchez le compte parent existant ou créez-en un nouveau pour associer cet élève
                </p>
                <div className="flex gap-3">
                  <Input
                    label="Email du parent"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent@example.com"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSearchParentModalOpen(true)}
                    className="mt-7"
                  >
                    Rechercher
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Si le parent n'existe pas, il sera créé automatiquement avec cet email
                </p>
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
                Annuler
              </Button>
              <Button type="submit" style={{ backgroundColor: '#fbbf24' }} disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer l\'Inscription'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal de recherche de parent */}
      <Modal
        isOpen={isSearchParentModalOpen}
        onClose={() => setIsSearchParentModalOpen(false)}
        title="Rechercher un Parent"
      >
        <div className="space-y-4">
          <Input
            label="Email du parent"
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="parent@example.com"
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSearchParentModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSearchParent}
              style={{ backgroundColor: '#fbbf24' }}
              disabled={isSearching}
            >
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

