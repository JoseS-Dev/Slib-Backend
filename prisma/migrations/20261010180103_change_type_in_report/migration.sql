/*
  Warnings:

  - The values [PRESTAMOS_ACTIVOS,PRESTAMOS_VENCIDOS,HISTORIAL_PRESTAMOS,INVENTARIO_GENERAL,LIBROS_MAS_SOLICITADOS,EJEMPLARES_BAJA,MULTAS_PENDIENTES,MULTAS_RECAUDADAS,USUARIOS_ACTIVOS] on the enum `ReportType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportType_new" AS ENUM ('Prestamo', 'Libro', 'Usuario', 'Mantenimiento');
ALTER TABLE "reports" ALTER COLUMN "typeReport" TYPE "ReportType_new" USING ("typeReport"::text::"ReportType_new");
ALTER TYPE "ReportType" RENAME TO "ReportType_old";
ALTER TYPE "ReportType_new" RENAME TO "ReportType";
DROP TYPE "public"."ReportType_old";
COMMIT;
