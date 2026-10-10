/*
  Warnings:

  - The values [BIENVENIDA,CAMBIO_ROL,SOLICITUD_CREADA,SOLICITUD_APROBADA,SOLICITUD_RECHAZADA,PRESTAMO_REGISTRADO,RECORDATORIO_DEVOLUCION,PRESTAMO_VENCIDO,DEVOLUCION_COMPLETADA,MULTA_GENERADA,SUSPENSION_APLICADA,INCIDENCIA_REPORTADA,INCIDENCIA_ACTUALIZADA,NUEVO_LIBRO_REGISTRADO] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('Informativa', 'Advertencia', 'Bienvenida', 'Solicitud', 'Incidencia', 'Suspension', 'Reporte', 'Multa');
ALTER TABLE "notifications" ALTER COLUMN "typeNotification" TYPE "NotificationType_new" USING ("typeNotification"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
