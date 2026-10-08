/*
  Warnings:

  - You are about to drop the column `requestId` on the `loans` table. All the data in the column will be lost.
  - Added the required column `requestItemId` to the `loans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_requestId_fkey";

-- DropIndex
DROP INDEX "loans_requestId_idx";

-- AlterTable
ALTER TABLE "loans" DROP COLUMN "requestId",
ADD COLUMN     "requestItemId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "loans_requestItemId_idx" ON "loans"("requestItemId");

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_requestItemId_fkey" FOREIGN KEY ("requestItemId") REFERENCES "request_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
