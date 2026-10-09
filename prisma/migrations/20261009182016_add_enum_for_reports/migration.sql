/*
  Warnings:

  - Changed the type of `typeReport` on the `reports` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PRESTAMOS_ACTIVOS', 'PRESTAMOS_VENCIDOS', 'HISTORIAL_PRESTAMOS', 'INVENTARIO_GENERAL', 'LIBROS_MAS_SOLICITADOS', 'EJEMPLARES_BAJA', 'MULTAS_PENDIENTES', 'MULTAS_RECAUDADAS', 'USUARIOS_ACTIVOS');

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "typeReport",
ADD COLUMN     "typeReport" "ReportType" NOT NULL;
