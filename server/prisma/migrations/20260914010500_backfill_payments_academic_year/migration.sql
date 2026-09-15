-- Rattache les paiements créés avant l'ajout de la gestion par année à l'année
-- académique active, pour qu'ils apparaissent dans le filtre par année et soient
-- couverts par la réinitialisation. Ne touche rien si aucune année active n'existe.
UPDATE "payments"
SET "academicYearId" = (
  SELECT id FROM "academic_years" WHERE "isActive" = true ORDER BY "startDate" DESC LIMIT 1
)
WHERE "academicYearId" IS NULL
  AND EXISTS (SELECT 1 FROM "academic_years" WHERE "isActive" = true);
