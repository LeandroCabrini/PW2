/*
  Warnings:

  - Changed the type of `Stats` on the `Application` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "Stats",
ADD COLUMN     "Stats" INTEGER NOT NULL;
