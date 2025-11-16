import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface ParsedRow {
  [key: string]: string;
}

export const StudentsImport = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);

  const parseCSV = (text: string) => {
    // very small CSV parser (no quoted fields handling)
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim());
      const obj: ParsedRow = {};
      headers.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
      return obj;
    });
  };

  const onFile = (f?: File) => {
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result ?? '');
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(f, 'UTF-8');
  };

  const submit = async () => {
    if (rows.length === 0) return alert('Aucune ligne à importer');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
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
      alert('Import terminé');
      setRows([]);
      setFileName(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Importation d'élèves (CSV)"
      subtitle="Chargez un fichier CSV, visualisez l’aperçu puis validez l’import."
    >
      <Card className="border-0 shadow-lg max-w-4xl">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-blue-900" htmlFor="student-import-file">
              Fichier CSV
            </label>
            <input
              id="student-import-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="mt-2"
            />
            {fileName && <div className="text-sm text-blue-700/70 mt-2">Fichier : {fileName}</div>}
          </div>

          <div>
            <h3 className="font-semibold text-blue-900 mb-3">Aperçu</h3>
            {rows.length === 0 ? (
              <div className="text-sm text-blue-700/70">Aucune donnée chargée</div>
            ) : (
              <div className="overflow-auto max-h-64 border border-blue-100 rounded-xl">
                <table className="table">
                  <thead>
                    <tr>
                      {Object.keys(rows[0]).map(h => (<th key={h}>{h}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((r, i) => (
                      <tr key={i}>
                        {Object.keys(r).map(k => (<td key={k}>{r[k]}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={submit}
              disabled={loading}
              className="bg-linear-to-r from-blue-600 via-blue-700 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {loading ? 'Import...' : 'Importer'}
            </Button>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default StudentsImport;
