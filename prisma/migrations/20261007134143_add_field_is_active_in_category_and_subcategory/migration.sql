-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "subcategories" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
