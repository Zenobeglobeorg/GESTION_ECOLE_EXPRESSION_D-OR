import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProtectedContent } from '../../components/permissions/ProtectedContent';
import { Modal } from '../../components/ui/Modal';

interface ParsedRow {
  [key: string]: string;
}

interface ImportResult {
  success: Array<{
    row: number;
    student: string;
    parent: string;
    parentWasCreated: boolean;
  }>;
  errors: Array<{
    row: number;
    student: string;
    error: string;
  }>;
  total: number;
}

export const StudentsImport = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Mapping des colonnes CSV aux champs attendus
  const fieldMapping: Record<string, string[]> = {
    firstName: ['firstName', 'prenom', 'Prénom', 'First Name', 'firstname'],
    lastName: ['lastName', 'nom', 'Nom', 'Last Name', 'lastname'],
    dateOfBirth: ['dateOfBirth', 'dateNaissance', 'Date de naissance', 'Date of Birth', 'Date Naissance', 'date_naissance'],
    parentEmail: ['parentEmail', 'emailParent', 'Email Parent', 'Email du parent', 'Parent Email', 'email_parent'],
    class: ['class', 'classe', 'Classe', 'Class'],
    schoolOfOrigin: ['schoolOfOrigin', 'ecoleProvenance', 'École de provenance', 'School of Origin'],
    hasDisability: ['hasDisability', 'handicap', 'Handicap'],
    disabilityDescription: ['disabilityDescription', 'descriptionHandicap', 'Description handicap', 'Disability Description'],
    isOrphan: ['isOrphan', 'orphelin', 'Orphelin'],
    orphanType: ['orphanType', 'typeOrphelin', 'Type orphelin', 'Orphan Type'],
    fatherName: ['fatherName', 'nomPere', 'Nom père', 'Father Name'],
    fatherContact: ['fatherContact', 'contactPere', 'Contact père', 'Father Contact'],
    motherName: ['motherName', 'nomMere', 'Nom mère', 'Mother Name'],
    motherContact: ['motherContact', 'contactMere', 'Contact mère', 'Mother Contact'],
    guardianName: ['guardianName', 'nomTuteur', 'Nom tuteur', 'Guardian Name'],
    guardianContact: ['guardianContact', 'contactTuteur', 'Contact tuteur', 'Guardian Contact'],
    paymentOption: ['paymentOption', 'optionPaiement', 'Option paiement', 'Payment Option'],
  };

  // Parser CSV amélioré qui gère les champs entre guillemets
  const parseCSV = (text: string): { headers: string[]; rows: ParsedRow[] } => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    // Parser la première ligne (headers)
    const headerLine = lines[0];
    const parsedHeaders: string[] = [];
    let currentHeader = '';
    let inQuotes = false;

    for (let i = 0; i < headerLine.length; i++) {
      const char = headerLine[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parsedHeaders.push(currentHeader.trim());
        currentHeader = '';
      } else {
        currentHeader += char;
      }
    }
    parsedHeaders.push(currentHeader.trim());

    // Parser les lignes de données
    const parsedRows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const row: ParsedRow = {};
      let currentField = '';
      let inQuotes = false;
      let fieldIndex = 0;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          if (fieldIndex < parsedHeaders.length) {
            row[parsedHeaders[fieldIndex]] = currentField.trim();
          }
          currentField = '';
          fieldIndex++;
        } else {
          currentField += char;
        }
      }
      // Ajouter le dernier champ
      if (fieldIndex < parsedHeaders.length) {
        row[parsedHeaders[fieldIndex]] = currentField.trim();
      }

      // Ne pas ajouter les lignes vides
      if (Object.values(row).some(val => val !== '')) {
        parsedRows.push(row);
      }
    }

    return { headers: parsedHeaders, rows: parsedRows };
  };

  const onFile = (f?: File) => {
    if (!f) return;
    setFileName(f.name);
    setRows([]);
    setHeaders([]);
    setError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
      const text = String(ev.target?.result ?? '');
        const { headers: parsedHeaders, rows: parsedRows } = parseCSV(text);
        
        if (parsedHeaders.length === 0) {
          setError('Le fichier CSV ne contient pas d\'en-têtes');
          return;
        }

        setHeaders(parsedHeaders);
        setRows(parsedRows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier');
      }
    };
    reader.onerror = () => {
      setError('Erreur lors de la lecture du fichier');
    };
    reader.readAsText(f, 'UTF-8');
  };


  const validateRow = (row: ParsedRow, index: number): string[] => {
    const errors: string[] = [];
    const rowNum = index + 2; // +2 car ligne 1 = headers

    // Trouver les valeurs en utilisant le mapping
    const getFieldValue = (fieldName: string): string => {
      const possibleNames = fieldMapping[fieldName] || [fieldName];
      for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== '') {
          return row[name];
        }
      }
      return '';
    };

    const firstName = getFieldValue('firstName');
    const lastName = getFieldValue('lastName');
    const dateOfBirth = getFieldValue('dateOfBirth');
    const parentEmail = getFieldValue('parentEmail');

    if (!firstName) errors.push(`Ligne ${rowNum}: Prénom manquant`);
    if (!lastName) errors.push(`Ligne ${rowNum}: Nom manquant`);
    if (!dateOfBirth) {
      errors.push(`Ligne ${rowNum}: Date de naissance manquante`);
    } else {
      const date = new Date(dateOfBirth);
      if (isNaN(date.getTime())) {
        errors.push(`Ligne ${rowNum}: Date de naissance invalide (${dateOfBirth})`);
      }
    }
    if (!parentEmail) {
      errors.push(`Ligne ${rowNum}: Email du parent manquant`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      errors.push(`Ligne ${rowNum}: Email du parent invalide (${parentEmail})`);
    }

    return errors;
  };

  const validateAllRows = (): string[] => {
    const allErrors: string[] = [];
    rows.forEach((row, index) => {
      const rowErrors = validateRow(row, index);
      allErrors.push(...rowErrors);
    });
    return allErrors;
  };

  const submit = async () => {
    if (rows.length === 0) {
      setError('Aucune ligne à importer');
      return;
    }

    // Valider toutes les lignes
    const validationErrors = validateAllRows();
    if (validationErrors.length > 0) {
      setError(`Erreurs de validation détectées:\n${validationErrors.slice(0, 10).join('\n')}${validationErrors.length > 10 ? `\n... et ${validationErrors.length - 10} autres erreurs` : ''}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/students/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rows }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de l\'import');
      }

      const result = await res.json();
      setImportResult(result.results);
      setIsResultModalOpen(true);
      setRows([]);
      setHeaders([]);
      setFileName(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'import';
      setError(errorMessage);
      console.error('Erreur import:', err);
    } finally {
      setLoading(false);
    }
  };

  const validationErrors = rows.length > 0 ? validateAllRows() : [];

  return (
    <AdminLayout
      title="Importation d'élèves (CSV)"
      subtitle="Chargez un fichier CSV, visualisez l'aperçu puis validez l'import."
    >
      <ProtectedContent permission="students.create" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission d'importer des élèves.
        </div>
      }>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg whitespace-pre-line">
            {error}
          </div>
        )}

        <Card className="border-0 shadow-lg max-w-6xl">
        <div className="space-y-6">
          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Format CSV attendu</h3>
            <p className="text-sm text-blue-800 mb-2">
              Le fichier CSV doit contenir les colonnes suivantes (les noms peuvent varier) :
            </p>
            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
              <li><strong>Obligatoires :</strong> Prénom (firstName, prenom), Nom (lastName, nom), Date de naissance (dateOfBirth, dateNaissance), Email du parent (parentEmail, emailParent)</li>
              <li><strong>Optionnelles :</strong> Classe, École de provenance, Handicap, Description handicap, Orphelin, Type orphelin, Informations parents/tuteurs, Option de paiement</li>
            </ul>
            <p className="text-xs text-blue-700 mt-2">
              💡 <strong>Astuce :</strong> Les colonnes peuvent être nommées en français ou en anglais. Le système détecte automatiquement les correspondances.
            </p>
          </div>

          {/* Upload de fichier */}
          <div>
            <label className="text-sm font-medium text-blue-900 block mb-2" htmlFor="student-import-file">
              Fichier CSV
            </label>
            <input
              id="student-import-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="block w-full text-sm text-blue-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {fileName && (
              <div className="text-sm text-blue-700/70 mt-2 flex items-center gap-2">
                <span>📄 Fichier : {fileName}</span>
                <span className="text-blue-600">({rows.length} ligne{rows.length > 1 ? 's' : ''} détectée{rows.length > 1 ? 's' : ''})</span>
              </div>
            )}
              </div>

          {/* Validation */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">
              ⚠️ {validationErrors.length} erreur{validationErrors.length > 1 ? 's' : ''} de validation détectée{validationErrors.length > 1 ? 's' : ''}
              </h3>
              <div className="max-h-40 overflow-y-auto">
                <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                  {validationErrors.slice(0, 20).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {validationErrors.length > 20 && (
                    <li className="font-semibold">... et {validationErrors.length - 20} autres erreurs</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Aperçu */}
          <div>
            <h3 className="font-semibold text-blue-900 mb-3">
              Aperçu des données ({rows.length} ligne{rows.length > 1 ? 's' : ''})
            </h3>
                {rows.length === 0 ? (
              <div className="text-sm text-blue-700/70 p-4 bg-blue-50 rounded-lg border border-blue-100">
                Aucune donnée chargée. Veuillez sélectionner un fichier CSV.
              </div>
            ) : (
              <div className="overflow-auto max-h-96 border border-blue-100 rounded-xl">
                <table className="table min-w-full">
                  <thead className="bg-blue-50 sticky top-0">
                    <tr>
                      {headers.map((h, idx) => (
                        <th key={idx} className="px-4 py-2 text-left text-xs font-semibold text-blue-900 uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-50">
                    {rows.slice(0, 50).map((r, i) => {
                      const rowErrors = validateRow(r, i);
                      return (
                        <tr key={i} className={rowErrors.length > 0 ? 'bg-yellow-50' : 'hover:bg-blue-50'}>
                          {headers.map((h, idx) => (
                            <td key={idx} className="px-4 py-2 text-sm text-blue-900">
                              {r[h] || <span className="text-gray-400">—</span>}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {rows.length > 50 && (
                  <div className="p-3 bg-blue-50 text-center text-sm text-blue-700">
                    ... et {rows.length - 50} autre{rows.length - 50 > 1 ? 's' : ''} ligne{rows.length - 50 > 1 ? 's' : ''} (affichage limité à 50 lignes)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
            <Button
              onClick={() => {
                setRows([]);
                setHeaders([]);
                setFileName(null);
                setError(null);
                setImportResult(null);
              }}
              variant="outline"
              disabled={loading || rows.length === 0}
            >
              Réinitialiser
            </Button>
            <ProtectedContent permission="students.create">
              <Button
                onClick={submit}
                disabled={loading || rows.length === 0 || validationErrors.length > 0}
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {loading ? 'Import en cours...' : `Importer ${rows.length} élève${rows.length > 1 ? 's' : ''}`}
              </Button>
            </ProtectedContent>
          </div>
        </div>
      </Card>

      {/* Modal de résultats */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Résultats de l'import"
        size="xl"
      >
        {importResult && (
          <div className="space-y-6">
            {/* Résumé */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <p className="text-2xl font-bold text-blue-900">{importResult.total}</p>
                <p className="text-sm text-blue-700">Total</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                <p className="text-2xl font-bold text-green-900">{importResult.success.length}</p>
                <p className="text-sm text-green-700">Réussis</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                <p className="text-2xl font-bold text-red-900">{importResult.errors.length}</p>
                <p className="text-sm text-red-700">Erreurs</p>
              </div>
            </div>

            {/* Succès */}
            {importResult.success.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-900 mb-2">
                  ✅ Élèves importés avec succès ({importResult.success.length})
                </h3>
                <div className="max-h-60 overflow-y-auto border border-green-200 rounded-lg">
                  <table className="table min-w-full">
                    <thead className="bg-green-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Ligne</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Élève</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Parent</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Statut</th>
                        </tr>
                      </thead>
                    <tbody className="bg-white divide-y divide-green-50">
                      {importResult.success.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm">{item.row}</td>
                          <td className="px-4 py-2 text-sm font-medium">{item.student}</td>
                          <td className="px-4 py-2 text-sm">{item.parent}</td>
                          <td className="px-4 py-2 text-sm">
                            {item.parentWasCreated ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Parent créé
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Parent existant
                              </span>
                            )}
                          </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                  </div>
                )}

            {/* Erreurs */}
            {importResult.errors.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-900 mb-2">
                  ❌ Erreurs ({importResult.errors.length})
                </h3>
                <div className="max-h-60 overflow-y-auto border border-red-200 rounded-lg">
                  <table className="table min-w-full">
                    <thead className="bg-red-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Ligne</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Élève</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Erreur</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-red-50">
                      {importResult.errors.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm">{item.row}</td>
                          <td className="px-4 py-2 text-sm font-medium">{item.student}</td>
                          <td className="px-4 py-2 text-sm text-red-700">{item.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setIsResultModalOpen(false);
                  setImportResult(null);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700"
              >
                Fermer
              </Button>
        </div>
    </div>
        )}
      </Modal>
      </ProtectedContent>
    </AdminLayout>
  );
};

export default StudentsImport;
