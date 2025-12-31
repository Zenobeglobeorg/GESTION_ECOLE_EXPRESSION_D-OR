import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ProtectedContent } from "../../components/permissions/ProtectedContent";

export const Reports = () => {
  const [reportType, setReportType] = useState("attendance");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [scope, setScope] = useState("all");
  const [format, setFormat] = useState("pdf");

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!dateRange.startDate || !dateRange.endDate) {
        alert("Veuillez sélectionner une plage de dates");
        return;
      }
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/reports/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reportType, dateRange, scope, format }),
        }
      );
      if (!response.ok) throw new Error("Erreur lors de la génération");
      alert(`Rapport ${format.toUpperCase()} généré avec succès`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const reportDescriptions: { [key: string]: string } = {
    attendance: "Rapport sur les absences, retards et présences",
    grades: "Rapport sur les résultats scolaires et performances",
    discipline: "Rapport sur la discipline et infractions",
    fees: "Rapport sur les frais de scolarité et paiements",
    teachers: "Rapport sur la performance des enseignants",
    students: "Rapport sur l'inscription et profils élèves",
  };

  return (
    <AdminLayout
      title="Générateur de Rapports"
      subtitle="Sélectionnez un périmètre et exportez vos rapports personnalisés."
    >
      <ProtectedContent permission="reports.generate" fallback={
        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700">
          Vous n'avez pas la permission de générer des rapports.
        </div>
      }>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <form onSubmit={handleGenerateReport} className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-blue-900">Type de rapport</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(reportDescriptions).map(type => (
                    <label
                      key={type}
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition ${
                        reportType === type
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-blue-100 hover:border-yellow-300 hover:bg-yellow-50/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportType"
                        value={type}
                        checked={reportType === type}
                        onChange={e => setReportType(e.target.value)}
                      />
                      <span className="capitalize font-semibold text-blue-900">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-blue-700/80">{reportDescriptions[reportType]}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="report-start">Date de début</label>
                  <input
                    id="report-start"
                    type="date"
                    className="form-control"
                    value={dateRange.startDate}
                    onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="text-sm font-medium text-blue-900" htmlFor="report-end">Date de fin</label>
                  <input
                    id="report-end"
                    type="date"
                    className="form-control"
                    value={dateRange.endDate}
                    onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-900">Portée du rapport</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { value: "all", label: "Toute l'école" },
                    { value: "class", label: "Par classe" },
                    { value: "level", label: "Par niveau" },
                    { value: "teacher", label: "Par enseignant" },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3 p-3 border border-blue-100 rounded-lg hover:bg-blue-50">
                      <input
                        type="radio"
                        name="scope"
                        value={option.value}
                        checked={scope === option.value}
                        onChange={e => setScope(e.target.value)}
                      />
                      <span className="text-sm text-blue-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-900">Format d&apos;exportation</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "pdf", label: "PDF" },
                    { value: "excel", label: "Excel" },
                    { value: "html", label: "HTML" },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-2 px-3 py-2 border border-blue-100 rounded-lg hover:bg-blue-50">
                      <input
                        type="radio"
                        name="format"
                        value={option.value}
                        checked={format === option.value}
                        onChange={e => setFormat(e.target.value)}
                      />
                      <span className="font-semibold text-blue-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

                <ProtectedContent permission="reports.generate">
                  <Button type="submit" className="w-full text-lg py-3 bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-blue-900 hover:from-yellow-500 hover:to-yellow-500">
                    Générer le rapport
                  </Button>
                </ProtectedContent>
              </form>
            </Card>
          </div>
        <div>
          <Card className="border-0 shadow-lg">
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-lg text-blue-900">Rapports récents</h3>
              {[
                { title: "Présences Novembre", detail: "PDF · 2025-01-02", color: "border-blue-500" },
                { title: "Notes Trimestre 2", detail: "Excel · 2024-12-28", color: "border-green-500" },
                { title: "Rapports Frais", detail: "HTML · 2024-12-25", color: "border-purple-500" },
              ].map((item) => (
                <div key={item.title} className={`border-l-4 ${item.color} pl-3 py-2 bg-blue-50/50 rounded-r-lg`}>
                  <p className="font-semibold text-sm text-blue-900">{item.title}</p>
                  <p className="text-xs text-blue-700/70">{item.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        </div>
      </ProtectedContent>
    </AdminLayout>
  );
};
