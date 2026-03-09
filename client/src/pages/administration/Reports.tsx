import { useState, useRef } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ProtectedContent } from "../../components/permissions/ProtectedContent";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ReportPayload {
  reportType: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  scope: string;
  generatedAt: string;
  count: number;
  data: Record<string, unknown>[];
}

export const Reports = () => {
  const [reportType, setReportType] = useState("attendance");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [scope, setScope] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reportPayload, setReportPayload] = useState<ReportPayload | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setReportPayload(null);
    if (!dateRange.startDate || !dateRange.endDate) {
      setError("Veuillez sélectionner les dates de début et de fin.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/reports/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportType,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          scope,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur lors de la génération du rapport");
      }
      const data: ReportPayload = await response.json();
      setReportPayload(data);
      setSuccess(`Rapport généré : ${data.count} enregistrement(s). Utilisez « Enregistrer en PDF » pour l'exporter.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const reportDescriptions: Record<string, string> = {
    attendance: "Présences, absences et retards sur la période",
    grades: "Notes et résultats sur la période",
    discipline: "Discipline (aucune donnée en base pour l'instant)",
    fees: "Paiements et frais de scolarité",
    teachers: "Liste des enseignants",
    students: "Élèves inscrits (période ou tous)",
  };

  const scopeLabels: Record<string, string> = {
    all: "Toute l'école",
    class: "Par classe",
    level: "Par niveau",
    teacher: "Par enseignant",
  };

  const columns = reportPayload?.data?.length
    ? (Object.keys(reportPayload.data[0]) as (keyof ReportPayload["data"][0])[])
    : [];

  return (
    <AdminLayout
      title="Générateur de Rapports"
      subtitle="Choisissez le type de rapport et la période, puis générez un rapport PDF."
    >
      <ProtectedContent
        permission="reports.generate"
        fallback={
          <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
            Vous n'avez pas la permission de générer des rapports.
          </div>
        }
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <form onSubmit={handleGenerateReport} className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-blue-900 dark:text-white">Type de rapport</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.keys(reportDescriptions).map((type) => (
                      <label
                        key={type}
                        className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition ${
                          reportType === type
                            ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-yellow-300 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportType"
                          value={type}
                          checked={reportType === type}
                          onChange={(e) => setReportType(e.target.value)}
                        />
                        <span className="capitalize font-semibold text-blue-900 dark:text-white">
                          {type === "fees" ? "Frais / Paiements" : type === "grades" ? "Notes" : type === "attendance" ? "Présences" : type === "teachers" ? "Enseignants" : type === "students" ? "Élèves" : type}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{reportDescriptions[reportType]}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-blue-900 dark:text-white" htmlFor="report-start">
                      Date de début
                    </label>
                    <input
                      id="report-start"
                      type="date"
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-900 dark:text-white" htmlFor="report-end">
                      Date de fin
                    </label>
                    <input
                      id="report-end"
                      type="date"
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900 dark:text-white">Portée</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["all", "class", "level", "teacher"].map((value) => (
                      <label
                        key={value}
                        className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="scope"
                          value={value}
                          checked={scope === value}
                          onChange={(e) => setScope(e.target.value)}
                        />
                        <span className="text-sm text-gray-900 dark:text-white">{scopeLabels[value]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Le rapport sera généré au format PDF (impression du navigateur → Enregistrer en PDF).
                </p>

                <ProtectedContent permission="reports.generate">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full text-lg py-3 bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500 disabled:opacity-50"
                  >
                    {loading ? "Génération..." : "Générer le rapport"}
                  </Button>
                </ProtectedContent>
              </form>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-lg">
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-lg text-blue-900 dark:text-white">Aide</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Choisissez le type de rapport et la période.</li>
                  <li>Cliquez sur « Générer le rapport ».</li>
                  <li>Consultez le résultat puis « Enregistrer en PDF » pour imprimer ou sauvegarder en PDF.</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>

        {reportPayload && (
          <Card className="border-0 shadow-lg mt-8 report-print-area">
            <div className="p-6">
              {/* En-tête avec logo pour l'écran et l'impression PDF */}
              <div className="report-header flex flex-col sm:flex-row items-center gap-4 pb-4 mb-4 border-b-2 border-yellow-500/50">
                <img
                  src="/logo expression d'or detourer.png"
                  alt="Logo École Expression d'Or"
                  className="h-16 w-auto object-contain print:h-20"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white print:text-xl" style={{ color: '#1a4d2e' }}>
                    ÉCOLE PRIVÉE L&apos;EXPRESSION D&apos;OR
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 print:text-base">
                    Rapport officiel
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="font-semibold text-xl text-blue-900 dark:text-white">
                  {reportPayload.title}
                  {reportPayload.startDate && reportPayload.endDate && (
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                      ({reportPayload.startDate} → {reportPayload.endDate})
                    </span>
                  )}
                </h3>
                <Button
                  type="button"
                  onClick={handlePrintPdf}
                  className="no-print bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold px-4 py-2 rounded-lg"
                >
                  Enregistrer en PDF / Imprimer
                </Button>
              </div>

              <div ref={printRef} className="overflow-x-auto">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 print:mb-2">
                  Généré le {new Date(reportPayload.generatedAt).toLocaleString("fr-FR")} · {reportPayload.count} ligne(s)
                </p>
                {reportPayload.data.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 py-4">Aucune donnée sur cette période.</p>
                ) : (
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                    <thead>
                      <tr className="bg-yellow-100 dark:bg-yellow-900/30">
                        {columns.map((col) => (
                          <th
                            key={String(col)}
                            className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold text-gray-900 dark:text-white capitalize"
                          >
                            {String(col)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportPayload.data.map((row, i) => (
                        <tr key={i} className="bg-white dark:bg-gray-800">
                          {columns.map((col) => (
                            <td
                              key={String(col)}
                              className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200"
                            >
                              {row[col] != null ? String(row[col]) : "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Card>
        )}

        <style>{`
          .report-header img {
            max-height: 5rem;
          }
          @media print {
            body * { visibility: hidden; }
            .report-print-area, .report-print-area * { visibility: visible; }
            .report-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 1rem; }
            .report-print-area .report-header {
              border-bottom-color: #1a4d2e !important;
              margin-bottom: 1rem;
            }
            .report-print-area .report-header img {
              max-height: 4.5rem;
            }
            .no-print { display: none !important; }
          }
        `}</style>
      </ProtectedContent>
    </AdminLayout>
  );
};
