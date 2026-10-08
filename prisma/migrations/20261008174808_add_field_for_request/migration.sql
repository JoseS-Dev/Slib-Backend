/*
  Warnings:

  - Added the required column `titleRequest` to the `requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "descriptionRequest" TEXT,
ADD COLUMN     "titleRequest" TEXT NOT NULL;
