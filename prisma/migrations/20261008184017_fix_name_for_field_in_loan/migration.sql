/*
  Warnings:

  - You are about to drop the column `pyhsicalCopyId` on the `loans` table. All the data in the column will be lost.
  - Added the required column `physicalCopyId` to the `loans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_pyhsicalCopyId_fkey";

-- DropIndex
DROP INDEX "loans_pyhsicalCopyId_idx";

-- AlterTable
ALTER TABLE "loans" DROP COLUMN "pyhsicalCopyId",
ADD COLUMN     "physicalCopyId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "loans_physicalCopyId_idx" ON "loans"("physicalCopyId");

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_physicalCopyId_fkey" FOREIGN KEY ("physicalCopyId") REFERENCES "physical_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
