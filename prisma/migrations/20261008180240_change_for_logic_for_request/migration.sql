/*
  Warnings:

  - You are about to drop the column `bookId` on the `requests` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RequestItemStatus" AS ENUM ('Pendiente', 'Aprobado', 'Rechazado');

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_bookId_fkey";

-- DropIndex
DROP INDEX "requests_bookId_idx";

-- AlterTable
ALTER TABLE "requests" DROP COLUMN "bookId";

-- CreateTable
CREATE TABLE "request_items" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "physicalCopyId" INTEGER NOT NULL,
    "status" "RequestItemStatus" NOT NULL DEFAULT 'Pendiente',

    CONSTRAINT "request_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "request_items_requestId_idx" ON "request_items"("requestId");

-- CreateIndex
CREATE INDEX "request_items_physicalCopyId_idx" ON "request_items"("physicalCopyId");

-- AddForeignKey
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_physicalCopyId_fkey" FOREIGN KEY ("physicalCopyId") REFERENCES "physical_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
