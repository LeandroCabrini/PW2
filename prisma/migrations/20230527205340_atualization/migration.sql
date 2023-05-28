/*
  Warnings:

  - The primary key for the `Application` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Application" DROP CONSTRAINT "Application_pkey",
ADD CONSTRAINT "Application_pkey" PRIMARY KEY ("IdUser", "IdProject");
