-- DropForeignKey
ALTER TABLE "suspensions" DROP CONSTRAINT "suspensions_fineId_fkey";

-- AlterTable
ALTER TABLE "suspensions" ALTER COLUMN "fineId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "suspensions" ADD CONSTRAINT "suspensions_fineId_fkey" FOREIGN KEY ("fineId") REFERENCES "fines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
